-- Auto-decline expired reschedule requests
-- This migration adds logic to automatically decline pending reschedule requests
-- when the original scheduled date is today or in the past

-- Update the update_visit_statuses_server function to handle expired reschedule requests
CREATE OR REPLACE FUNCTION public.update_visit_statuses_server()
RETURNS INTEGER AS $$
DECLARE
	philippine_date DATE;
	philippine_timestamp TIMESTAMP WITH TIME ZONE;
	affected_rows INTEGER := 0;
	additional_affected_rows INTEGER;
	end_of_day_time TIME := '23:59:59';
	gate_fields_exist BOOLEAN;
	reschedule_fields_exist BOOLEAN;
	visit_record RECORD;
	log_row RECORD;
	new_history JSONB;
	place_details JSONB;
	total_places INTEGER;
	completed_places INTEGER;
	existing_events INTEGER;
	v_log_id UUID;
BEGIN
	-- Check if gate fields exist in the scheduled_visits table
	SELECT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name = 'scheduled_visits' 
		AND column_name = 'gate_entrance_scanned'
	) INTO gate_fields_exist;

	-- Check if reschedule fields exist in the scheduled_visits table
	SELECT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name = 'scheduled_visits' 
		AND column_name = 'reschedule_status'
	) INTO reschedule_fields_exist;

	-- Get current Philippine date and timestamp
	philippine_date := public.get_philippine_date();
	philippine_timestamp := public.get_philippine_timestamp();

	-- 0. Auto-decline expired reschedule requests (before processing visit statuses)
	-- Decline pending reschedule requests where the original date is today or in the past
	IF reschedule_fields_exist THEN
		-- Bulk update: decline all expired reschedule requests
		UPDATE scheduled_visits
		SET
			reschedule_status = 'declined',
			reschedule_decided_at = philippine_timestamp,
			reschedule_decided_by = NULL, -- System action
			reschedule_note = 'Reschedule request automatically declined: original scheduled date has passed.'
		WHERE reschedule_requested = TRUE
		  AND reschedule_status = 'pending'
		  AND (
			  -- Original date is in the past
			  (reschedule_original_date IS NOT NULL AND reschedule_original_date < philippine_date)
			  OR
			  -- Original date is today (regardless of time)
			  (reschedule_original_date IS NOT NULL AND reschedule_original_date = philippine_date)
			  OR
			  -- Fallback: if reschedule_original_date is NULL but visit_date is today or past
			  (reschedule_original_date IS NULL AND visit_date <= philippine_date)
		  );

		GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
		affected_rows := affected_rows + additional_affected_rows;

		-- Log each auto-declined reschedule request
		FOR visit_record IN
			SELECT id, visitor_user_id, visitor_role, reschedule_original_date, visit_date, reschedule_reason
			FROM scheduled_visits
			WHERE reschedule_requested = TRUE
			  AND reschedule_status = 'declined'
			  AND reschedule_decided_at >= (philippine_timestamp - INTERVAL '1 minute')
			  AND reschedule_decided_by IS NULL -- Only auto-declined ones
		LOOP
			-- Log the auto-decline action (only if visitor_user_id exists)
			IF visit_record.visitor_user_id IS NOT NULL THEN
				BEGIN
					v_log_id := public.log_action(
						visit_record.visitor_user_id,
						'visit_reschedule_declined',
						jsonb_build_object(
							'visit_id', visit_record.id,
							'original_date', COALESCE(visit_record.reschedule_original_date, visit_record.visit_date),
							'reason', visit_record.reschedule_reason,
							'note', 'Reschedule request automatically declined: original scheduled date has passed.',
							'auto_declined', true,
							'declined_at', philippine_timestamp
						)
					);
				EXCEPTION WHEN OTHERS THEN
					-- Silently ignore logging errors
					NULL;
				END;
			END IF;
		END LOOP;
	END IF;

	-- 1. Handle completed_flagged visits (only if gate fields exist)
	-- These are visits that have:
	-- 1. Started the process (entrance scanned)
	-- 2. All places completed by personnel
	-- 3. No exit scan
	-- 4. It's past end of day OR it's a past date
	-- 5. Status is 'pending' OR 'in_progress'
	IF gate_fields_exist THEN
		UPDATE scheduled_visits 
		SET 
			status = 'completed_flagged',
			completed_at = philippine_timestamp,
			completed_by = NULL -- System action
		WHERE status IN ('pending', 'in_progress')
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
			  WHERE sv.status IN ('pending', 'in_progress')
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
	END IF;

	-- 2. Mark visits stuck in temporary_exit past end of day as completed_flagged
	UPDATE scheduled_visits 
	SET status = 'completed_flagged', completed_at = philippine_timestamp, completed_by = NULL
	WHERE status = 'temporary_exit'
	  AND (
		visit_date < philippine_date OR (visit_date = philippine_date AND philippine_timestamp::TIME > end_of_day_time)
	  );
	GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
	affected_rows := affected_rows + additional_affected_rows;

	-- 2b. For the visits just marked completed_flagged above, fail any remaining pending places
	UPDATE scheduled_visit_places 
	SET 
		status = 'failed',
		completed_at = philippine_timestamp,
		completed_by = NULL
	WHERE visit_id IN (
		SELECT id FROM scheduled_visits 
		WHERE status = 'completed_flagged' 
		  AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
	)
	AND status = 'pending';

	-- 3. Mark visits with entrance scanned but not all places completed as completed_flagged
	-- These are visits that:
	-- 1. Are from today but past end of day OR past dates
	-- 2. Have entrance scanned (process started)
	-- 3. Do not have exit scanned
	-- 4. Not all places are completed
	-- 5. Status is 'pending' OR 'in_progress'
	IF gate_fields_exist THEN
		UPDATE scheduled_visits 
		SET 
			status = 'completed_flagged',
			completed_at = philippine_timestamp,
			completed_by = NULL -- System action
		WHERE status IN ('pending', 'in_progress')
		  AND (
			  -- Past dates
			  visit_date < philippine_date
			  OR
			  -- Today but past end of day
			  (visit_date = philippine_date AND philippine_timestamp::TIME > end_of_day_time)
		  )
		  AND gate_entrance_scanned = TRUE  -- Must have scanned entrance (process started)
		  AND gate_exit_scanned = FALSE     -- Must not have scanned exit
		  AND id IN (
			  -- Find visits where not all places are completed
			  SELECT sv.id
			  FROM scheduled_visits sv
			  WHERE sv.status IN ('pending', 'in_progress')
				AND (
					sv.visit_date < philippine_date
					OR (sv.visit_date = philippine_date AND philippine_timestamp::TIME > end_of_day_time)
				)
				AND sv.gate_entrance_scanned = TRUE
				AND sv.gate_exit_scanned = FALSE
				AND EXISTS (
					SELECT 1 
					FROM scheduled_visit_places svp 
					WHERE svp.visit_id = sv.id 
					  AND svp.status != 'completed'
				)
		  );

		GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
		affected_rows := affected_rows + additional_affected_rows;
	END IF;

	-- 4. Mark remaining past visits as unsuccessful
	-- These are visits that:
	-- 1. Are from past dates AND did not scan an entrance gate, OR
	-- 2. Are from today but past end of day AND did not scan an entrance gate
	-- 3. Status is 'pending' OR 'in_progress'
	UPDATE scheduled_visits 
	SET 
		status = 'unsuccessful',
		completed_at = philippine_timestamp,
		completed_by = NULL -- System action
	WHERE status IN ('pending', 'in_progress')
	  AND (
		  -- Past dates AND did not scan entrance gate
		  (visit_date < philippine_date 
		   AND (NOT gate_fields_exist OR gate_entrance_scanned = FALSE))
		  OR
		  -- Today but past end of day AND did not scan entrance gate
		  (visit_date = philippine_date 
		   AND philippine_timestamp::TIME > end_of_day_time
		   AND (NOT gate_fields_exist OR gate_entrance_scanned = FALSE))
	  );

	GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
	affected_rows := affected_rows + additional_affected_rows;

	-- 5. Mark places as failed for visits that were just marked as unsuccessful or completed_flagged
	UPDATE scheduled_visit_places 
	SET 
		status = 'failed',
		completed_at = philippine_timestamp,
		completed_by = NULL
	WHERE visit_id IN (
		SELECT id FROM scheduled_visits 
		WHERE status IN ('unsuccessful', 'completed_flagged')
		  AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
	)
	AND status = 'pending';

	-- 6. Log completed_flagged visits
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
				
				-- Get place details for logging
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
				
				-- Add completed_flagged event to the history
				new_history := (log_row.details->'history') || jsonb_build_array(
					jsonb_build_object(
						'event', 'completed_flagged',
						'timestamp', philippine_timestamp,
						'details', jsonb_build_object(
							'by', 'system',
							'reason', 'Visit completed by personnel but visitor did not scan exit gate',
							'places', place_details,
							'total_places', total_places,
							'completed_places', completed_places,
							'gate_entrance_scanned', visit_record.gate_entrance_scanned,
							'gate_exit_scanned', visit_record.gate_exit_scanned,
							'auto_marked', true
						)
					)
				);
				
				-- Update the log entry
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

	-- 7. Log unsuccessful visits
	FOR visit_record IN 
		SELECT id, visitor_user_id, visitor_role, visit_date, gate_entrance_scanned, gate_exit_scanned
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
			-- Count existing 'unsuccessful' events in the history
			SELECT COUNT(*) INTO existing_events
			FROM jsonb_array_elements(log_row.details->'history') AS history_item
			WHERE history_item->>'event' = 'unsuccessful';
			
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
				
				-- Get place details for logging
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
				
				-- Add unsuccessful event to the history
				new_history := (log_row.details->'history') || jsonb_build_array(
					jsonb_build_object(
						'event', 'unsuccessful',
						'timestamp', philippine_timestamp,
						'details', jsonb_build_object(
							'by', 'system',
							'reason', 'Visit not completed by end of day or past date',
							'places', place_details,
							'total_places', total_places,
							'completed_places', completed_places,
							'gate_entrance_scanned', visit_record.gate_entrance_scanned,
							'gate_exit_scanned', visit_record.gate_exit_scanned,
							'auto_marked', true
						)
					)
				);
				
				-- Update the log entry
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

-- Also update the fix_pending_past_visits function to handle expired reschedule requests
CREATE OR REPLACE FUNCTION public.fix_pending_past_visits()
RETURNS TEXT AS $$
DECLARE
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    gate_fields_exist BOOLEAN;
    reschedule_fields_exist BOOLEAN;
    result_text TEXT := '';
    affected_rows INTEGER := 0;
    total_affected INTEGER := 0;
    visit_record RECORD;
    v_log_id UUID;
BEGIN
    -- Get current Philippine date and timestamp
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();
    
    -- Check if gate fields exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_visits' 
        AND column_name = 'gate_entrance_scanned'
    ) INTO gate_fields_exist;

    -- Check if reschedule fields exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_visits' 
        AND column_name = 'reschedule_status'
    ) INTO reschedule_fields_exist;
    
    result_text := result_text || 'Fixing pending and in_progress past visits...' || E'\n';
    result_text := result_text || 'Current date: ' || philippine_date || E'\n';
    result_text := result_text || 'Gate fields exist: ' || gate_fields_exist || E'\n';
    result_text := result_text || 'Reschedule fields exist: ' || reschedule_fields_exist || E'\n';
    
    -- Step 0: Auto-decline expired reschedule requests
    IF reschedule_fields_exist THEN
        UPDATE scheduled_visits
        SET
            reschedule_status = 'declined',
            reschedule_decided_at = philippine_timestamp,
            reschedule_decided_by = NULL,
            reschedule_note = 'Reschedule request automatically declined: original scheduled date has passed.'
        WHERE reschedule_requested = TRUE
          AND reschedule_status = 'pending'
          AND (
              (reschedule_original_date IS NOT NULL AND reschedule_original_date <= philippine_date)
              OR
              (reschedule_original_date IS NULL AND visit_date <= philippine_date)
          );

        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        result_text := result_text || 'Step 0: Auto-declined ' || affected_rows || ' expired reschedule requests' || E'\n';

        -- Log each auto-declined reschedule request
        FOR visit_record IN
            SELECT id, visitor_user_id, reschedule_original_date, visit_date, reschedule_reason
            FROM scheduled_visits
            WHERE reschedule_requested = TRUE
              AND reschedule_status = 'declined'
              AND reschedule_decided_at >= (philippine_timestamp - INTERVAL '1 minute')
              AND reschedule_decided_by IS NULL
        LOOP
            IF visit_record.visitor_user_id IS NOT NULL THEN
                BEGIN
                    v_log_id := public.log_action(
                        visit_record.visitor_user_id,
                        'visit_reschedule_declined',
                        jsonb_build_object(
                            'visit_id', visit_record.id,
                            'original_date', COALESCE(visit_record.reschedule_original_date, visit_record.visit_date),
                            'reason', visit_record.reschedule_reason,
                            'note', 'Reschedule request automatically declined: original scheduled date has passed.',
                            'auto_declined', true,
                            'declined_at', philippine_timestamp
                        )
                    );
                EXCEPTION WHEN OTHERS THEN
                    NULL;
                END;
            END IF;
        END LOOP;
    END IF;
    
    -- Step 1: Mark visits with entrance scanned as completed_flagged
    IF gate_fields_exist THEN
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = philippine_timestamp,
            completed_by = NULL
        WHERE status IN ('pending', 'in_progress')
          AND visit_date < philippine_date
          AND gate_entrance_scanned = TRUE
          AND gate_exit_scanned = FALSE;
        
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        total_affected := total_affected + affected_rows;
        result_text := result_text || 'Step 1: Marked ' || affected_rows || ' visits as completed_flagged (entrance scanned, no exit)' || E'\n';
    END IF;
    
    -- Step 2: Mark visits without entrance scan as unsuccessful
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL
    WHERE status IN ('pending', 'in_progress')
      AND visit_date < philippine_date
      AND (NOT gate_fields_exist OR gate_entrance_scanned = FALSE);
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    result_text := result_text || 'Step 2: Marked ' || affected_rows || ' visits as unsuccessful (no entrance scan)' || E'\n';
    
    -- Step 3: Mark places as failed for the updated visits
    UPDATE scheduled_visit_places 
    SET 
        status = 'failed',
        completed_at = philippine_timestamp,
        completed_by = NULL
    WHERE visit_id IN (
        SELECT id FROM scheduled_visits 
        WHERE status IN ('unsuccessful', 'completed_flagged')
          AND completed_at >= (philippine_timestamp - INTERVAL '1 minute')
    )
    AND status = 'pending';
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    result_text := result_text || 'Step 3: Marked ' || affected_rows || ' places as failed' || E'\n';
    
    result_text := result_text || E'\nTotal affected visits: ' || total_affected || E'\n';
    
    -- Show remaining pending and in_progress visits
    SELECT COUNT(*) INTO affected_rows
    FROM scheduled_visits 
    WHERE status IN ('pending', 'in_progress');
    
    result_text := result_text || 'Remaining pending/in_progress visits: ' || affected_rows || E'\n';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

