-- Consolidated Visit Status System
-- This migration consolidates all previous visit status logic into a single, coherent system
-- with three end statuses: Completed, Completed (Flagged), Unsuccessful

-- Ensure all required enum values exist
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'completed_flagged';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'visit_completed_flagged';

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.mark_past_visits_unsuccessful() CASCADE;
DROP FUNCTION IF EXISTS public.update_completed_flagged_visits() CASCADE;
DROP FUNCTION IF EXISTS public.manual_update_completed_flagged_visits() CASCADE;

-- Create the consolidated function to handle all visit status updates
CREATE OR REPLACE FUNCTION public.update_visit_statuses()
RETURNS INTEGER AS $$
DECLARE
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    affected_rows INTEGER := 0;
    additional_affected_rows INTEGER;
    end_of_day_time TIME := '23:59:59';
    gate_fields_exist BOOLEAN;
    visit_record RECORD;
    log_row RECORD;
    new_history JSONB;
    place_details JSONB;
    total_places INTEGER;
    completed_places INTEGER;
    existing_events INTEGER;
BEGIN
    -- Check if gate fields exist in the scheduled_visits table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_visits' 
        AND column_name = 'gate_entrance_scanned'
    ) INTO gate_fields_exist;
    
    -- Get current Philippine date and timestamp
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();
    
    -- Handle completed_flagged visits (only if gate fields exist)
    -- These are visits that have:
    -- 1. Started the process (entrance scanned)
    -- 2. All places completed by personnel
    -- 3. No exit scan
    -- 4. It's past end of day OR it's a past date
    IF gate_fields_exist THEN
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = philippine_timestamp,
            completed_by = NULL -- System action
        WHERE status = 'pending' 
          AND (
              -- Past dates
              visit_date < philippine_date
              OR
              -- Today but past end of day
              (visit_date = philippine_date AND philippine_timestamp::TIME > end_of_day_time)
          )
          AND gate_entrance_scanned = TRUE  -- Must have scanned entrance (process started)
          AND gate_exit_scanned = FALSE     -- Must not have scanned exit (process not fully completed)
          AND id IN (
              -- Find visits where all places are completed
              SELECT sv.id
              FROM scheduled_visits sv
              WHERE sv.status = 'pending'
                AND (
                    sv.visit_date < philippine_date
                    OR (sv.visit_date = philippine_date AND philippine_timestamp::TIME > end_of_day_time)
                )
                AND sv.gate_entrance_scanned = TRUE
                AND sv.gate_exit_scanned = FALSE
                AND NOT EXISTS (
                    SELECT 1 
                    FROM scheduled_visit_places svp 
                    WHERE svp.visit_id = sv.id 
                      AND svp.status != 'completed'
                )
          );
        
        GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
        affected_rows := affected_rows + additional_affected_rows;
        
        -- Log completed_flagged visits
        FOR visit_record IN 
            SELECT id, visitor_user_id, visitor_role, visit_date, gate_entrance_scanned, gate_exit_scanned
            FROM scheduled_visits 
            WHERE status = 'completed_flagged' 
              AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
        LOOP
            -- Find the original visit_scheduled log entry for this visit
            SELECT * INTO log_row 
            FROM logs 
            WHERE details->>'visit_id' = visit_record.id::text 
              AND action = 'visit_scheduled' 
            ORDER BY created_at LIMIT 1;
            
            -- If we found the original log entry, check if it already has a completed_flagged event
            IF log_row.id IS NOT NULL THEN
                -- Count existing 'completed_flagged' events in the history
                SELECT COUNT(*) INTO existing_events
                FROM jsonb_array_elements(log_row.details->'history') AS history_item
                WHERE history_item->>'event' = 'completed_flagged';
                
                -- Only add the completed_flagged event if it doesn't already exist
                IF existing_events = 0 THEN
                    -- Get place completion statistics and place names for logging
                    SELECT 
                        COUNT(*) INTO total_places
                    FROM scheduled_visit_places 
                    WHERE visit_id = visit_record.id;
                    
                    SELECT 
                        COUNT(*) INTO completed_places
                    FROM scheduled_visit_places 
                    WHERE visit_id = visit_record.id AND status = 'completed';
                    
                    -- Get place names for this visit
                    SELECT 
                        jsonb_agg(
                            jsonb_build_object(
                                'place_id', svp.place_id,
                                'place_name', ptv.name,
                                'place_location', ptv.location,
                                'status', svp.status
                            )
                        ) INTO place_details
                    FROM scheduled_visit_places svp
                    LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
                    WHERE svp.visit_id = visit_record.id;
                    
                    new_history := (log_row.details->'history') || jsonb_build_array(
                        jsonb_build_object(
                            'event', 'completed_flagged',
                            'timestamp', philippine_timestamp,
                            'details', jsonb_build_object(
                                'by', 'system',
                                'reason', 'Visit process started (entrance scanned) and all places completed by personnel, but visitor did not complete the full process (no exit scan)',
                                'auto_marked', true,
                                'total_places', total_places,
                                'completed_places', completed_places,
                                'places', place_details,
                                'philippine_date', philippine_date,
                                'philippine_time', philippine_timestamp::TIME,
                                'note', 'Visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process'
                            )
                        )
                    );
                    
                    -- Update the log entry to reflect the completed_flagged status
                    UPDATE logs 
                    SET 
                        action = 'visit_completed_flagged',
                        details = jsonb_set(
                            jsonb_set(log_row.details, '{history}', new_history),
                            '{current_status}',
                            '"completed_flagged"'
                        ) 
                    WHERE id = log_row.id;
                END IF;
            END IF;
        END LOOP;
    END IF;
    
    -- Mark remaining pending visits as unsuccessful
    -- These are visits that:
    -- 1. Are from past dates, OR
    -- 2. Are from today but past end of day AND either:
    --    a) Did not scan an entrance gate, OR
    --    b) Not all places are completed
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL -- System action
    WHERE status = 'pending' 
      AND (
          -- Past dates
          visit_date < philippine_date
          OR
          -- Today but past end of day
          (visit_date = philippine_date AND philippine_timestamp::TIME > end_of_day_time)
      )
      AND (
          -- For past dates, mark all as unsuccessful
          visit_date < philippine_date
          OR
          -- For today, only mark as unsuccessful if:
          -- 1. Did not scan entrance gate, OR
          -- 2. Not all places are completed
          (
              visit_date = philippine_date
              AND (
                  (gate_fields_exist AND gate_entrance_scanned = FALSE)
                  OR
                  id IN (
                      SELECT sv.id
                      FROM scheduled_visits sv
                      WHERE sv.status = 'pending'
                        AND sv.visit_date = philippine_date
                        AND EXISTS (
                            SELECT 1 
                            FROM scheduled_visit_places svp 
                            WHERE svp.visit_id = sv.id 
                              AND svp.status != 'completed'
                        )
                  )
              )
          )
      );
    
    GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
    affected_rows := affected_rows + additional_affected_rows;
    
    -- Mark places as failed for visits that were just marked as unsuccessful
    UPDATE scheduled_visit_places 
    SET 
        status = 'failed',
        completed_at = philippine_timestamp,
        completed_by = NULL
    WHERE visit_id IN (
        SELECT id FROM scheduled_visits 
        WHERE status = 'unsuccessful' 
          AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
    )
    AND status = 'pending';
    
    -- Update the original visit_scheduled log entries to reflect the unsuccessful status
    FOR visit_record IN 
        SELECT id, visitor_user_id, visitor_role, visit_date, gate_entrance_scanned
        FROM scheduled_visits 
        WHERE status = 'unsuccessful' 
          AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
    LOOP
        -- Find the original visit_scheduled log entry for this visit
        SELECT * INTO log_row 
        FROM logs 
        WHERE details->>'visit_id' = visit_record.id::text 
          AND action = 'visit_scheduled' 
        ORDER BY created_at LIMIT 1;
        
        -- If we found the original log entry, check if it already has an unsuccessful event
        IF log_row.id IS NOT NULL THEN
            -- Count existing 'marked_unsuccessful' events in the history
            SELECT COUNT(*) INTO existing_events
            FROM jsonb_array_elements(log_row.details->'history') AS history_item
            WHERE history_item->>'event' = 'marked_unsuccessful';
            
            -- Only add the unsuccessful event if it doesn't already exist
            IF existing_events = 0 THEN
                -- Get place completion statistics and place names for logging
                SELECT 
                    COUNT(*) INTO total_places
                FROM scheduled_visit_places 
                WHERE visit_id = visit_record.id;
                
                SELECT 
                    COUNT(*) INTO completed_places
                FROM scheduled_visit_places 
                WHERE visit_id = visit_record.id AND status = 'completed';
                
                -- Get place names for this visit
                SELECT 
                    jsonb_agg(
                        jsonb_build_object(
                            'place_id', svp.place_id,
                            'place_name', ptv.name,
                            'place_location', ptv.location,
                            'status', svp.status
                        )
                    ) INTO place_details
                FROM scheduled_visit_places svp
                LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
                WHERE svp.visit_id = visit_record.id;
                
                new_history := (log_row.details->'history') || jsonb_build_array(
                    jsonb_build_object(
                        'event', 'marked_unsuccessful',
                        'timestamp', philippine_timestamp,
                        'details', jsonb_build_object(
                            'by', 'system',
                            'reason', CASE 
                                WHEN visit_record.visit_date < philippine_date THEN 'Visit was not completed on or before the scheduled date'
                                WHEN gate_fields_exist AND visit_record.gate_entrance_scanned = FALSE THEN 'Visit did not scan entrance gate by end of day'
                                ELSE 'Not all places were completed by the end of the scheduled day (23:59:59)'
                            END,
                            'auto_marked', true,
                            'total_places', total_places,
                            'completed_places', completed_places,
                            'incomplete_places', total_places - completed_places,
                            'places', place_details,
                            'philippine_date', philippine_date,
                            'philippine_time', philippine_timestamp::TIME
                        )
                    )
                );
                
                -- Update the log entry to reflect the unsuccessful status
                UPDATE logs 
                SET details = jsonb_set(
                    jsonb_set(log_row.details, '{history}', new_history),
                    '{current_status}',
                    '"unsuccessful"'
                ) 
                WHERE id = log_row.id;
            END IF;
        END IF;
    END LOOP;
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to manually trigger the status update (for admin use)
CREATE OR REPLACE FUNCTION public.manual_update_visit_statuses()
RETURNS TEXT AS $$
DECLARE
    affected_visits INTEGER;
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current Philippine date and timestamp
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();
    
    -- Call the status update function
    affected_visits := public.update_visit_statuses();
    
    -- Return a detailed message
    RETURN json_build_object(
        'message', 'Manual visit status update completed successfully',
        'affected_visits', affected_visits,
        'philippine_date', philippine_date,
        'philippine_timestamp', philippine_timestamp,
        'executed_at', philippine_timestamp
    )::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to force update all pending visits (for testing and immediate updates)
CREATE OR REPLACE FUNCTION public.force_update_all_visit_statuses()
RETURNS TEXT AS $$
DECLARE
    affected_visits INTEGER;
    additional_affected_rows INTEGER;
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    gate_fields_exist BOOLEAN;
BEGIN
    -- Check if gate fields exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_visits' 
        AND column_name = 'gate_entrance_scanned'
    ) INTO gate_fields_exist;
    
    -- Get current Philippine date and timestamp
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();
    
    -- Force update all pending visits regardless of time
    -- This is useful for testing and immediate updates
    
    -- First, handle completed_flagged visits
    IF gate_fields_exist THEN
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = philippine_timestamp,
            completed_by = NULL
        WHERE status = 'pending' 
          AND gate_entrance_scanned = TRUE
          AND gate_exit_scanned = FALSE
          AND id IN (
              SELECT sv.id
              FROM scheduled_visits sv
              WHERE sv.status = 'pending'
                AND sv.gate_entrance_scanned = TRUE
                AND sv.gate_exit_scanned = FALSE
                AND NOT EXISTS (
                    SELECT 1 
                    FROM scheduled_visit_places svp 
                    WHERE svp.visit_id = sv.id 
                      AND svp.status != 'completed'
                )
          );
        
        GET DIAGNOSTICS affected_visits = ROW_COUNT;
    ELSE
        affected_visits := 0;
    END IF;
    
    -- Then, mark remaining pending visits as unsuccessful
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL
    WHERE status = 'pending' 
      AND (
          -- Past dates
          visit_date < philippine_date
          OR
          -- Today but either no entrance scan or incomplete places
          (
              visit_date = philippine_date
              AND (
                  (gate_fields_exist AND gate_entrance_scanned = FALSE)
                  OR
                  id IN (
                      SELECT sv.id
                      FROM scheduled_visits sv
                      WHERE sv.status = 'pending'
                        AND sv.visit_date = philippine_date
                        AND EXISTS (
                            SELECT 1 
                            FROM scheduled_visit_places svp 
                            WHERE svp.visit_id = sv.id 
                              AND svp.status != 'completed'
                        )
                  )
              )
          )
      );
    
            GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
        affected_visits := affected_visits + additional_affected_rows;
    
    -- Mark places as failed for visits that were just marked as unsuccessful
    UPDATE scheduled_visit_places 
    SET 
        status = 'failed',
        completed_at = philippine_timestamp,
        completed_by = NULL
    WHERE visit_id IN (
        SELECT id FROM scheduled_visits 
        WHERE status = 'unsuccessful' 
          AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
    )
    AND status = 'pending';
    
    -- Return a detailed message
    RETURN json_build_object(
        'message', 'Force update completed successfully',
        'affected_visits', affected_visits,
        'philippine_date', philippine_date,
        'philippine_timestamp', philippine_timestamp,
        'executed_at', philippine_timestamp,
        'force_update', true
    )::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the complete_visit function to ensure proper status handling
CREATE OR REPLACE FUNCTION public.complete_visit(
    p_visit_id UUID,
    p_completed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_record RECORD;
    personnel_role user_role;
    visitor_name TEXT;
    place_details JSONB;
    total_places INTEGER;
    completed_places INTEGER;
    log_id UUID;
BEGIN
    -- Check if the user completing is personnel
    SELECT role INTO personnel_role 
    FROM user_roles 
    WHERE user_id = p_completed_by;
    
    IF personnel_role NOT IN ('personnel', 'admin') THEN
        RAISE EXCEPTION 'Only personnel can complete visits';
    END IF;
    
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Check if visit is already completed
    IF visit_record.status IN ('completed', 'completed_flagged', 'unsuccessful') THEN
        RAISE EXCEPTION 'Visit is already completed or marked as unsuccessful';
    END IF;
    
    -- Get place completion statistics
    SELECT 
        COUNT(*) INTO total_places
    FROM scheduled_visit_places 
    WHERE visit_id = p_visit_id;
    
    SELECT 
        COUNT(*) INTO completed_places
    FROM scheduled_visit_places 
    WHERE visit_id = p_visit_id AND status = 'completed';
    
    -- Check if all places are completed
    IF completed_places < total_places THEN
        RAISE EXCEPTION 'Cannot complete visit - not all places are completed';
    END IF;
    
    -- Get place details for logging
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'place_id', svp.place_id,
                'place_name', ptv.name,
                'place_location', ptv.location,
                'status', svp.status,
                'completed_at', svp.completed_at,
                'completed_by', svp.completed_by
            )
        ) INTO place_details
    FROM scheduled_visit_places svp
    LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
    WHERE svp.visit_id = p_visit_id;
    
    -- Determine visit status based on gate exit scan
    IF visit_record.gate_exit_scanned THEN
        -- Visitor scanned exit, mark as completed
        UPDATE scheduled_visits 
        SET 
            status = 'completed',
            completed_at = public.get_philippine_timestamp(),
            completed_by = p_completed_by
        WHERE id = p_visit_id;
    ELSE
        -- No exit scan, keep as pending until end of day
        -- The visit will be marked as completed_flagged at end of day by update_visit_statuses()
        UPDATE scheduled_visits 
        SET 
            status = 'pending', -- Keep as pending until end of day
            completed_at = NULL,
            completed_by = NULL
        WHERE id = p_visit_id;
        
        -- Return early since we're not actually completing the visit yet
        RETURN TRUE;
    END IF;
    
    -- Get visitor name for logging
    visitor_name := visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name;
    
    -- Log the visit completion
    log_id := public.log_action(
        p_completed_by,
        'visit_completed',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'visitor_name', visitor_name,
            'visitor_email', visit_record.visitor_email,
            'visitor_role', visit_record.visitor_role,
            'visit_date', visit_record.visit_date,
            'purpose', visit_record.purpose,
            'is_guest', visit_record.visitor_role = 'guest',
            'completed_at', public.get_philippine_timestamp(),
            'completed_by', p_completed_by,
            'status', CASE WHEN visit_record.gate_exit_scanned THEN 'completed' ELSE 'pending' END,
            'places', place_details,
            'total_places', total_places,
            'completed_places', completed_places,
            'gate_exit_scanned', visit_record.gate_exit_scanned,
            'note', CASE 
                WHEN visit_record.gate_exit_scanned THEN 'Visit completed normally with exit scan'
                ELSE 'Visit places completed but no exit scan - will be flagged at end of day if no exit scan'
            END
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_status_visit_date ON scheduled_visits(status, visit_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_gate_entrance_exit ON scheduled_visits(gate_entrance_scanned, gate_exit_scanned, visit_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_completion_status ON scheduled_visits(status, completed_at, visit_date);

-- Create a function to get visit statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_visit_statistics()
RETURNS TABLE (
    total_visits BIGINT,
    completed_visits BIGINT,
    completed_flagged_visits BIGINT,
    unsuccessful_visits BIGINT,
    pending_visits BIGINT,
    today_visits BIGINT,
    today_completed BIGINT,
    today_completed_flagged BIGINT,
    today_unsuccessful BIGINT,
    today_pending BIGINT
) AS $$
DECLARE
    philippine_date DATE;
BEGIN
    -- Get current Philippine date
    philippine_date := public.get_philippine_date();
    
    RETURN QUERY
    SELECT 
        COUNT(*) as total_visits,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_visits,
        COUNT(*) FILTER (WHERE status = 'completed_flagged') as completed_flagged_visits,
        COUNT(*) FILTER (WHERE status = 'unsuccessful') as unsuccessful_visits,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_visits,
        COUNT(*) FILTER (WHERE visit_date = philippine_date) as today_visits,
        COUNT(*) FILTER (WHERE visit_date = philippine_date AND status = 'completed') as today_completed,
        COUNT(*) FILTER (WHERE visit_date = philippine_date AND status = 'completed_flagged') as today_completed_flagged,
        COUNT(*) FILTER (WHERE visit_date = philippine_date AND status = 'unsuccessful') as today_unsuccessful,
        COUNT(*) FILTER (WHERE visit_date = philippine_date AND status = 'pending') as today_pending
    FROM scheduled_visits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;