-- Add support for "completed (flagged)" status for visits without exit scans

-- Add new status to visit_status enum
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'completed_flagged';

-- Create function to update visit status to completed_flagged when all places are completed but no exit scan
CREATE OR REPLACE FUNCTION public.update_completed_flagged_visits()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    visit_record RECORD;
    philippine_date DATE;
    log_row RECORD;
    new_history JSONB;
    place_details JSONB;
BEGIN
    -- Get current Philippine date
    philippine_date := public.get_philippine_date();
    
    -- Find visits that are pending, have all places completed, but no exit scan
    FOR visit_record IN 
        SELECT sv.*, 
               COUNT(svp.id) as total_places,
               COUNT(CASE WHEN svp.status = 'completed' THEN 1 END) as completed_places
        FROM scheduled_visits sv
        LEFT JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        WHERE sv.visit_date = philippine_date 
          AND sv.status = 'pending' 
          AND sv.gate_exit_scanned = FALSE
          AND sv.flagged_for_no_exit = FALSE
        GROUP BY sv.id
        HAVING COUNT(svp.id) > 0 AND COUNT(svp.id) = COUNT(CASE WHEN svp.status = 'completed' THEN 1 END)
    LOOP
        -- Update visit status to completed_flagged
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = public.get_philippine_timestamp(),
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
                    'timestamp', public.get_philippine_timestamp(),
                    'details', jsonb_build_object(
                        'by', 'system',
                        'reason', 'All places completed by personnel but visitor did not scan exit gate',
                        'total_places', visit_record.total_places,
                        'completed_places', visit_record.completed_places,
                        'places', place_details,
                        'note', 'Visit completed (flagged) - personnel finished their part but visitor did not scan exit'
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
                    'completed_at', public.get_philippine_timestamp(),
                    'completed_by', visit_record.completed_by,
                    'status', 'completed_flagged',
                    'places', place_details,
                    'total_places', visit_record.total_places,
                    'completed_places', visit_record.completed_places,
                    'note', 'Visit completed (flagged) - personnel finished their part but visitor did not scan exit'
                )
            );
        END IF;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get visit details for flagged completed visits
CREATE OR REPLACE FUNCTION public.get_flagged_completed_visit_details(p_visit_id UUID)
RETURNS TABLE (
    visit_id UUID,
    visitor_first_name VARCHAR(100),
    visitor_last_name VARCHAR(100),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    visitor_user_id UUID,
    visitor_role user_role,
    visit_date DATE,
    purpose VARCHAR(255),
    other_purpose TEXT,
    status visit_status,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    gate_entrance_scanned BOOLEAN,
    gate_entrance_scanned_at TIMESTAMP WITH TIME ZONE,
    gate_entrance_scanned_by UUID,
    gate_exit_scanned BOOLEAN,
    gate_exit_scanned_at TIMESTAMP WITH TIME ZONE,
    gate_exit_scanned_by UUID,
    flagged_for_no_exit BOOLEAN,
    flagged_at TIMESTAMP WITH TIME ZONE,
    flagged_by UUID,
    places JSONB,
    total_places BIGINT,
    completed_places BIGINT,
    completed_by_info JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sv.id as visit_id,
        sv.visitor_first_name,
        sv.visitor_last_name,
        sv.visitor_email,
        sv.visitor_phone,
        sv.visitor_user_id,
        sv.visitor_role,
        sv.visit_date,
        sv.purpose,
        sv.other_purpose,
        sv.status,
        sv.scheduled_at,
        sv.completed_at,
        sv.completed_by,
        sv.gate_entrance_scanned,
        sv.gate_entrance_scanned_at,
        sv.gate_entrance_scanned_by,
        sv.gate_exit_scanned,
        sv.gate_exit_scanned_at,
        sv.gate_exit_scanned_by,
        sv.flagged_for_no_exit,
        sv.flagged_at,
        sv.flagged_by,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'place_id', svp.place_id,
                    'place_name', ptv.name,
                    'place_description', ptv.description,
                    'place_location', ptv.location,
                    'status', svp.status,
                    'completed_at', svp.completed_at,
                    'completed_by', svp.completed_by
                )
            )
            FROM scheduled_visit_places svp
            LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
            WHERE svp.visit_id = sv.id),
            '[]'::jsonb
        ) as places,
        (SELECT COUNT(*) FROM scheduled_visit_places svp2 WHERE svp2.visit_id = sv.id) as total_places,
        (SELECT COUNT(*) FROM scheduled_visit_places svp3 WHERE svp3.visit_id = sv.id AND svp3.status = 'completed') as completed_places,
        COALESCE(
            (SELECT jsonb_build_object(
                'first_name', ur.first_name,
                'last_name', ur.last_name,
                'email', ur.email,
                'role', ur.role
            )
            FROM user_roles ur
            WHERE ur.user_id = sv.completed_by),
            '{}'::jsonb
        ) as completed_by_info
    FROM scheduled_visits sv
    WHERE sv.id = p_visit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the mark_past_visits_unsuccessful function to handle completed_flagged visits
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
    
    -- First, update completed_flagged visits for today
    PERFORM public.update_completed_flagged_visits();
    
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
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL -- System action, no specific user
    WHERE status = 'pending' 
      AND visit_date = philippine_date
      AND (philippine_timestamp::TIME > end_of_day_time)
      AND id IN (
          -- Find visits where not all places are completed
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

-- Create indexes for better performance (without using the new enum value in the same transaction)
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_status_visit_date ON scheduled_visits(status, visit_date); 