-- Fix the mark_past_visits_unsuccessful function to handle missing gate fields gracefully
-- This migration fixes the error: record "visit_record" has no field "gate_entrance_scanned"

-- Drop and recreate the function to fix the field access issues
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
    gate_fields_exist BOOLEAN;
BEGIN
    -- Check if gate fields exist in the scheduled_visits table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_visits' 
        AND column_name = 'gate_entrance_scanned'
    ) INTO gate_fields_exist;
    
    -- Get current Philippine date and timestamp (UTC+8) using the new function
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();
    
    -- First, update completed_flagged visits for today (only at end of day)
    IF gate_fields_exist THEN
        PERFORM public.update_completed_flagged_visits();
    END IF;
    
    -- Mark pending visits from past dates as unsuccessful
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL -- System action, no specific user
    WHERE status = 'pending' 
      AND visit_date < philippine_date;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
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
    IF gate_fields_exist THEN
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
    END IF;
    
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
                                WHEN gate_fields_exist THEN 'Visit did not scan entrance gate by end of day'
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
    
    -- Log completed_flagged visits (only if gate fields exist)
    IF gate_fields_exist THEN
        FOR visit_record IN 
            SELECT id, visitor_user_id, visitor_role, visit_date
            FROM scheduled_visits 
            WHERE status = 'completed_flagged' 
              AND visit_date = philippine_date
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
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
