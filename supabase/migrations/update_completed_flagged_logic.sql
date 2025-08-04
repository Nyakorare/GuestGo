-- Update the completed_flagged logic to ensure it works correctly
-- This migration ensures that visits with all places completed by personnel but no exit scan
-- are properly marked as completed_flagged at end of day

-- First, ensure the completed_flagged status exists
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'completed_flagged';

-- Update the mark_past_visits_unsuccessful function to properly handle completed_flagged logic
CREATE OR REPLACE FUNCTION public.mark_past_visits_unsuccessful()
RETURNS INTEGER AS $$
DECLARE
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    affected_rows INTEGER;
    additional_affected_rows INTEGER;
    end_of_day_affected_rows INTEGER;
    visit_record RECORD;
    log_row RECORD;
    new_history JSONB;
    existing_unsuccessful_events INTEGER;
    total_places INTEGER;
    completed_places INTEGER;
    place_details JSONB;
    end_of_day_time TIME := '23:59:59';
BEGIN
    -- Get current Philippine date and timestamp (UTC+8) using the new function
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();
    
    -- First, handle completed_flagged visits for today (only at end of day)
    -- This is the key logic: mark visits as completed_flagged if they have:
    -- 1. Started the process (entrance scanned)
    -- 2. All places completed by personnel
    -- 3. No exit scan
    -- 4. It's past end of day
    UPDATE scheduled_visits 
    SET 
        status = 'completed_flagged',
        completed_at = philippine_timestamp,
        completed_by = NULL -- System action, no specific user
    WHERE status = 'pending' 
      AND visit_date = philippine_date
      AND (philippine_timestamp::TIME > end_of_day_time)
      AND gate_entrance_scanned = TRUE  -- Must have scanned entrance (process started)
      AND gate_exit_scanned = FALSE     -- Must not have scanned exit (process not fully completed)
      AND id IN (
          -- Find visits where all places are completed
          SELECT sv.id
          FROM scheduled_visits sv
          WHERE sv.status = 'pending'
            AND sv.visit_date = philippine_date
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
    affected_rows := additional_affected_rows;
    
    -- Handle past visits that had entrance scans and completed places but no exit scan
    -- These should be marked as completed_flagged instead of unsuccessful
    UPDATE scheduled_visits 
    SET 
        status = 'completed_flagged',
        completed_at = philippine_timestamp,
        completed_by = NULL -- System action, no specific user
    WHERE status = 'pending' 
      AND visit_date < philippine_date
      AND gate_entrance_scanned = TRUE  -- Must have scanned entrance (process started)
      AND gate_exit_scanned = FALSE     -- Must not have scanned exit (process not fully completed)
      AND id IN (
          -- Find visits where all places are completed
          SELECT sv.id
          FROM scheduled_visits sv
          WHERE sv.status = 'pending'
            AND sv.visit_date < philippine_date
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
    
    -- Mark remaining pending visits from past dates as unsuccessful
    -- (those that don't meet the completed_flagged criteria)
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL -- System action, no specific user
    WHERE status = 'pending' 
      AND visit_date < philippine_date;
    
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
          AND visit_date < philippine_date
          AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
    )
    AND status = 'pending';
    
    -- Mark visits as unsuccessful if they are from today but not all places are completed
    -- AND it's past end of day (23:59:59 Philippine time)
    -- OR if they did not scan an entrance gate
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL -- System action, no specific user
    WHERE status = 'pending' 
      AND visit_date = philippine_date
      AND (philippine_timestamp::TIME > end_of_day_time)
      AND (
          -- Case 1: Not all places are completed
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
          OR
          -- Case 2: Did not scan an entrance gate
          gate_entrance_scanned = FALSE
      );
    
    GET DIAGNOSTICS end_of_day_affected_rows = ROW_COUNT;
    affected_rows := affected_rows + end_of_day_affected_rows;
    
    -- Mark places as failed for end-of-day visits that were just marked as unsuccessful
    UPDATE scheduled_visit_places 
    SET 
        status = 'failed',
        completed_at = philippine_timestamp,
        completed_by = NULL
    WHERE visit_id IN (
        SELECT id FROM scheduled_visits 
        WHERE status = 'unsuccessful' 
          AND visit_date = philippine_date
          AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
    )
    AND status = 'pending';
    
    -- Update the original visit_scheduled log entries to reflect the status change
    FOR visit_record IN 
        SELECT id, visitor_user_id, visitor_role, visit_date
        FROM scheduled_visits 
        WHERE status = 'unsuccessful' 
          AND (
              visit_date < philippine_date
              OR (
                  visit_date = philippine_date
                  AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
              )
          )
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
            SELECT COUNT(*) INTO existing_unsuccessful_events
            FROM jsonb_array_elements(log_row.details->'history') AS history_item
            WHERE history_item->>'event' = 'marked_unsuccessful';
            
            -- Only add the unsuccessful event if it doesn't already exist
            IF existing_unsuccessful_events = 0 THEN
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
                                WHEN visit_record.gate_entrance_scanned = FALSE THEN 'Visit did not scan entrance gate by end of day'
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
    
    -- Log completed_flagged visits (both today and past visits)
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
            SELECT COUNT(*) INTO existing_unsuccessful_events
            FROM jsonb_array_elements(log_row.details->'history') AS history_item
            WHERE history_item->>'event' = 'completed_flagged';
            
            -- Only add the completed_flagged event if it doesn't already exist
            IF existing_unsuccessful_events = 0 THEN
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
                            'reason', CASE 
                                WHEN visit_record.visit_date < philippine_date THEN 'Past visit with entrance scan and completed places but no exit scan'
                                ELSE 'Visit process started (entrance scanned) and all places completed by personnel, but visitor did not complete the full process (no exit scan)'
                            END,
                            'auto_marked', true,
                            'total_places', total_places,
                            'completed_places', completed_places,
                            'places', place_details,
                            'philippine_date', philippine_date,
                            'philippine_time', philippine_timestamp::TIME,
                            'visit_date', visit_record.visit_date,
                            'note', CASE 
                                WHEN visit_record.visit_date < philippine_date THEN 'Past visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process'
                                ELSE 'Visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process'
                            END
                        )
                    )
                );
                
                -- Update the log entry to reflect the completed_flagged status
                UPDATE logs 
                SET details = jsonb_set(
                    jsonb_set(log_row.details, '{history}', new_history),
                    '{current_status}',
                    '"completed_flagged"'
                ) 
                WHERE id = log_row.id;
            END IF;
        END IF;
    END LOOP;
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to manually trigger the completed_flagged logic for testing
CREATE OR REPLACE FUNCTION public.manual_update_completed_flagged_visits()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    visit_record RECORD;
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    log_row RECORD;
    new_history JSONB;
    place_details JSONB;
BEGIN
    -- Get current Philippine date and timestamp
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();
    
    -- Find visits that have started the process (entrance scanned), have all places completed, but no exit scan
    -- This includes both today's visits and past visits
    FOR visit_record IN 
        SELECT sv.*, 
               COUNT(svp.id) as total_places,
               COUNT(CASE WHEN svp.status = 'completed' THEN 1 END) as completed_places
        FROM scheduled_visits sv
        LEFT JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        WHERE sv.status = 'pending' 
          AND sv.gate_entrance_scanned = TRUE  -- Process must have started
          AND sv.gate_exit_scanned = FALSE     -- Process not fully completed
          AND sv.flagged_for_no_exit = FALSE
        GROUP BY sv.id
        HAVING COUNT(svp.id) > 0 AND COUNT(svp.id) = COUNT(CASE WHEN svp.status = 'completed' THEN 1 END)
    LOOP
        -- Update visit status to completed_flagged
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = philippine_timestamp,
            completed_by = visit_record.completed_by
        WHERE id = visit_record.id;
        
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
        WHERE svp.visit_id = visit_record.id;
        
        -- Try to find existing log entry for this visit
        SELECT * INTO log_row FROM logs WHERE details->>'visit_id' = visit_record.id::text AND action = 'visit_scheduled' ORDER BY created_at LIMIT 1;
        
        IF log_row.id IS NOT NULL THEN
            -- Update existing log entry
            new_history := (log_row.details->'history') || jsonb_build_array(
                jsonb_build_object(
                    'event', 'completed_flagged',
                    'timestamp', philippine_timestamp,
                    'details', jsonb_build_object(
                        'by', 'system',
                        'reason', CASE 
                            WHEN visit_record.visit_date < philippine_date THEN 'Past visit with entrance scan and completed places but no exit scan'
                            ELSE 'Visit process started (entrance scanned) and all places completed by personnel, but visitor did not complete the full process (no exit scan)'
                        END,
                        'total_places', visit_record.total_places,
                        'completed_places', visit_record.completed_places,
                        'places', place_details,
                        'visit_date', visit_record.visit_date,
                        'note', CASE 
                            WHEN visit_record.visit_date < philippine_date THEN 'Past visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process'
                            ELSE 'Visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process'
                        END,
                        'manual_trigger', true
                    )
                )
            );
            
            UPDATE logs SET details = jsonb_set(
                jsonb_set(log_row.details, '{history}', new_history),
                '{current_status}',
                '"completed_flagged"'
            ) WHERE id = log_row.id;
        ELSE
            -- Create new log entry for visits without existing logs
            PERFORM public.log_action(
                visit_record.completed_by,
                'visit_completed',
                jsonb_build_object(
                    'visit_id', visit_record.id,
                    'visitor_name', visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name,
                    'visitor_email', visit_record.visitor_email,
                    'visitor_role', visit_record.visitor_role,
                    'visit_date', visit_record.visit_date,
                    'purpose', visit_record.purpose,
                    'is_guest', visit_record.visitor_role = 'guest',
                    'completed_at', philippine_timestamp,
                    'completed_by', visit_record.completed_by,
                    'status', 'completed_flagged',
                    'places', place_details,
                    'total_places', visit_record.total_places,
                    'completed_places', visit_record.completed_places,
                    'note', CASE 
                        WHEN visit_record.visit_date < philippine_date THEN 'Past visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process'
                        ELSE 'Visit completed (flagged) - process started and personnel finished their part, but visitor did not complete the full process'
                    END,
                    'manual_trigger', true
                )
            );
        END IF;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_status_visit_date ON scheduled_visits(status, visit_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_gate_entrance_exit ON scheduled_visits(gate_entrance_scanned, gate_exit_scanned, visit_date); 