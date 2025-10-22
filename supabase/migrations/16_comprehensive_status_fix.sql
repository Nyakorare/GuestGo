-- Comprehensive Status Fix and Testing Functions
-- This migration combines all status update fixes, test functions, and debugging tools

-- ============================================================================
-- 1. SERVER-SIDE STATUS UPDATE FUNCTIONS (from migration 16)
-- ============================================================================

-- Create a server-side function that can be called without authentication
CREATE OR REPLACE FUNCTION public.update_visit_statuses_server()
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

	-- 1. Handle completed_flagged visits (only if gate fields exist)
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
	-- 1. Are from today but past end of day
	-- 2. Have entrance scanned (process started)
	-- 3. Do not have exit scanned
	-- 4. Not all places are completed
	IF gate_fields_exist THEN
		UPDATE scheduled_visits 
		SET 
			status = 'completed_flagged',
			completed_at = philippine_timestamp,
			completed_by = NULL -- System action
		WHERE status = 'pending' 
		  AND visit_date = philippine_date
		  AND philippine_timestamp::TIME > end_of_day_time
		  AND gate_entrance_scanned = TRUE  -- Must have scanned entrance (process started)
		  AND gate_exit_scanned = FALSE     -- Must not have scanned exit
		  AND id IN (
			  -- Find visits where not all places are completed
			  SELECT sv.id
			  FROM scheduled_visits sv
			  WHERE sv.status = 'pending'
				AND sv.visit_date = philippine_date
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
	UPDATE scheduled_visits 
	SET 
		status = 'unsuccessful',
		completed_at = philippine_timestamp,
		completed_by = NULL -- System action
	WHERE status = 'pending' 
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

-- Create a function that can be called from the client without role restrictions
CREATE OR REPLACE FUNCTION public.update_visit_statuses_public()
RETURNS TEXT AS $$
DECLARE
	affected_visits INTEGER := 0;
	philippine_date DATE;
	philippine_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
	philippine_date := public.get_philippine_date();
	philippine_timestamp := public.get_philippine_timestamp();

	-- Call the server-side function
	affected_visits := public.update_visit_statuses_server();

	RETURN json_build_object(
		'message', 'Visit statuses updated successfully',
		'affected_visits', affected_visits,
		'philippine_date', philippine_date,
		'philippine_timestamp', philippine_timestamp,
		'executed_at', philippine_timestamp
	)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the original function to use the server-side logic
CREATE OR REPLACE FUNCTION public.update_visit_statuses()
RETURNS INTEGER AS $$
BEGIN
	-- Delegate to the server-side function
	RETURN public.update_visit_statuses_server();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the force update function to use the server-side logic
CREATE OR REPLACE FUNCTION public.force_update_all_visit_statuses()
RETURNS TEXT AS $$
DECLARE
	affected_visits INTEGER := 0;
	philippine_date DATE;
	philippine_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
	philippine_date := public.get_philippine_date();
	philippine_timestamp := public.get_philippine_timestamp();

	affected_visits := public.update_visit_statuses_server();

	RETURN json_build_object(
		'message', 'All visit statuses updated successfully',
		'affected_visits', affected_visits,
		'philippine_date', philippine_date,
		'philippine_timestamp', philippine_timestamp,
		'executed_at', philippine_timestamp
	)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. AUTOMATIC CRON JOBS (from migration 17)
-- ============================================================================

-- Enable the pg_cron extension if it's available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run visit status updates every hour
SELECT cron.schedule(
    'update-visit-statuses',
    '0 * * * *', -- Every hour at minute 0
    'SELECT public.update_visit_statuses_server();'
);

-- Also create a more frequent job for end-of-day updates (every 15 minutes after 11 PM Philippine time)
SELECT cron.schedule(
    'update-visit-statuses-end-of-day',
    '*/15 23 * * *', -- Every 15 minutes from 11 PM to 11:59 PM
    'SELECT public.update_visit_statuses_server();'
);

-- Create a function to manually trigger status updates (for testing and immediate updates)
CREATE OR REPLACE FUNCTION public.trigger_visit_status_update()
RETURNS TEXT AS $$
DECLARE
    result INTEGER;
    message TEXT;
BEGIN
    -- Call the status update function
    result := public.update_visit_statuses_server();
    
    message := 'Visit status update triggered. Affected visits: ' || result;
    
    -- Log the trigger
    INSERT INTO logs (action, details, created_at)
    VALUES (
        'visit_status_update_triggered',
        jsonb_build_object(
            'affected_visits', result,
            'triggered_at', public.get_philippine_timestamp(),
            'triggered_by', 'system'
        ),
        public.get_philippine_timestamp()
    );
    
    RETURN message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. TEST AND DEBUG FUNCTIONS (from migration 18)
-- ============================================================================

-- Create a function to test status updates with detailed logging
CREATE OR REPLACE FUNCTION public.test_visit_status_update()
RETURNS TEXT AS $$
DECLARE
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    gate_fields_exist BOOLEAN;
    pending_visits_count INTEGER;
    past_visits_count INTEGER;
    entrance_scanned_count INTEGER;
    exit_scanned_count INTEGER;
    result_text TEXT := '';
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
    
    -- Count pending visits
    SELECT COUNT(*) INTO pending_visits_count
    FROM scheduled_visits 
    WHERE status = 'pending';
    
    -- Count past visits
    SELECT COUNT(*) INTO past_visits_count
    FROM scheduled_visits 
    WHERE status = 'pending' AND visit_date < philippine_date;
    
    -- Count visits with entrance scanned
    SELECT COUNT(*) INTO entrance_scanned_count
    FROM scheduled_visits 
    WHERE status = 'pending' AND gate_entrance_scanned = TRUE;
    
    -- Count visits with exit scanned
    SELECT COUNT(*) INTO exit_scanned_count
    FROM scheduled_visits 
    WHERE status = 'pending' AND gate_exit_scanned = TRUE;
    
    result_text := result_text || 'Current Philippine Date: ' || philippine_date || E'\n';
    result_text := result_text || 'Current Philippine Timestamp: ' || philippine_timestamp || E'\n';
    result_text := result_text || 'Gate fields exist: ' || gate_fields_exist || E'\n';
    result_text := result_text || 'Pending visits: ' || pending_visits_count || E'\n';
    result_text := result_text || 'Past visits: ' || past_visits_count || E'\n';
    result_text := result_text || 'Entrance scanned: ' || entrance_scanned_count || E'\n';
    result_text := result_text || 'Exit scanned: ' || exit_scanned_count || E'\n';
    
    -- Show details of pending past visits
    result_text := result_text || E'\n--- PENDING PAST VISITS ---\n';
    
    -- Call the actual status update function
    PERFORM public.update_visit_statuses_server();
    
    -- Count after update
    SELECT COUNT(*) INTO pending_visits_count
    FROM scheduled_visits 
    WHERE status = 'pending';
    
    result_text := result_text || 'Pending visits after update: ' || pending_visits_count || E'\n';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to show details of a specific visit
CREATE OR REPLACE FUNCTION public.debug_visit(visit_email TEXT)
RETURNS TEXT AS $$
DECLARE
    visit_record RECORD;
    place_record RECORD;
    result_text TEXT := '';
BEGIN
    -- Get visit details
    SELECT * INTO visit_record
    FROM scheduled_visits 
    WHERE visitor_email = visit_email
    ORDER BY scheduled_at DESC
    LIMIT 1;
    
    IF visit_record.id IS NULL THEN
        RETURN 'Visit not found for email: ' || visit_email;
    END IF;
    
    result_text := result_text || 'Visit ID: ' || visit_record.id || E'\n';
    result_text := result_text || 'Visitor: ' || visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name || E'\n';
    result_text := result_text || 'Email: ' || visit_record.visitor_email || E'\n';
    result_text := result_text || 'Visit Date: ' || visit_record.visit_date || E'\n';
    result_text := result_text || 'Status: ' || visit_record.status || E'\n';
    result_text := result_text || 'Gate Entrance Scanned: ' || COALESCE(visit_record.gate_entrance_scanned::TEXT, 'NULL') || E'\n';
    result_text := result_text || 'Gate Exit Scanned: ' || COALESCE(visit_record.gate_exit_scanned::TEXT, 'NULL') || E'\n';
    result_text := result_text || 'Scheduled At: ' || visit_record.scheduled_at || E'\n';
    result_text := result_text || 'Completed At: ' || COALESCE(visit_record.completed_at::TEXT, 'NULL') || E'\n';
    
    -- Get place details
    result_text := result_text || E'\n--- PLACES ---\n';
    FOR place_record IN 
        SELECT svp.*, ptv.name as place_name, ptv.location
        FROM scheduled_visit_places svp
        LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
        WHERE svp.visit_id = visit_record.id
    LOOP
        result_text := result_text || 'Place: ' || place_record.place_name || ' (' || place_record.location || ')' || E'\n';
        result_text := result_text || 'Status: ' || place_record.status || E'\n';
        result_text := result_text || 'Completed At: ' || COALESCE(place_record.completed_at::TEXT, 'NULL') || E'\n';
        result_text := result_text || '---' || E'\n';
    END LOOP;
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. FORCE UPDATE FUNCTIONS (from migration 19)
-- ============================================================================

-- Create a function to force update a specific visit by email
CREATE OR REPLACE FUNCTION public.force_update_visit_by_email(visit_email TEXT)
RETURNS TEXT AS $$
DECLARE
    visit_record RECORD;
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    gate_fields_exist BOOLEAN;
    result_text TEXT := '';
    affected_rows INTEGER := 0;
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
    
    -- Get the visit record
    SELECT * INTO visit_record
    FROM scheduled_visits 
    WHERE visitor_email = visit_email
    ORDER BY scheduled_at DESC
    LIMIT 1;
    
    IF visit_record.id IS NULL THEN
        RETURN 'Visit not found for email: ' || visit_email;
    END IF;
    
    result_text := result_text || 'Found visit: ' || visit_record.id || E'\n';
    result_text := result_text || 'Current status: ' || visit_record.status || E'\n';
    result_text := result_text || 'Visit date: ' || visit_record.visit_date || E'\n';
    result_text := result_text || 'Is past date: ' || (visit_record.visit_date < philippine_date) || E'\n';
    result_text := result_text || 'Gate entrance scanned: ' || COALESCE(visit_record.gate_entrance_scanned::TEXT, 'NULL') || E'\n';
    result_text := result_text || 'Gate exit scanned: ' || COALESCE(visit_record.gate_exit_scanned::TEXT, 'NULL') || E'\n';
    
    -- Only process if status is pending
    IF visit_record.status != 'pending' THEN
        RETURN result_text || 'Visit is not pending, current status: ' || visit_record.status;
    END IF;
    
    -- Check if it's a past date
    IF visit_record.visit_date < philippine_date THEN
        result_text := result_text || 'Processing as past date visit...' || E'\n';
        
        -- If gate fields exist and entrance was scanned, mark as completed_flagged
        IF gate_fields_exist AND visit_record.gate_entrance_scanned = TRUE AND visit_record.gate_exit_scanned = FALSE THEN
            result_text := result_text || 'Marking as completed_flagged (entrance scanned, no exit)...' || E'\n';
            
            UPDATE scheduled_visits 
            SET 
                status = 'completed_flagged',
                completed_at = philippine_timestamp,
                completed_by = NULL
            WHERE id = visit_record.id;
            
            GET DIAGNOSTICS affected_rows = ROW_COUNT;
            result_text := result_text || 'Updated ' || affected_rows || ' visit(s)' || E'\n';
            
        -- If no entrance scan, mark as unsuccessful
        ELSIF NOT gate_fields_exist OR visit_record.gate_entrance_scanned = FALSE THEN
            result_text := result_text || 'Marking as unsuccessful (no entrance scan)...' || E'\n';
            
            UPDATE scheduled_visits 
            SET 
                status = 'unsuccessful',
                completed_at = philippine_timestamp,
                completed_by = NULL
            WHERE id = visit_record.id;
            
            GET DIAGNOSTICS affected_rows = ROW_COUNT;
            result_text := result_text || 'Updated ' || affected_rows || ' visit(s)' || E'\n';
        ELSE
            result_text := result_text || 'Visit has exit scanned, no action needed' || E'\n';
        END IF;
    ELSE
        result_text := result_text || 'Visit is not from a past date, no action taken' || E'\n';
    END IF;
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to force update all pending past visits
CREATE OR REPLACE FUNCTION public.force_update_all_pending_past_visits()
RETURNS TEXT AS $$
DECLARE
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    gate_fields_exist BOOLEAN;
    result_text TEXT := '';
    affected_rows INTEGER := 0;
    total_affected INTEGER := 0;
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
    
    result_text := result_text || 'Processing pending past visits...' || E'\n';
    result_text := result_text || 'Current date: ' || philippine_date || E'\n';
    result_text := result_text || 'Gate fields exist: ' || gate_fields_exist || E'\n';
    
    -- Mark visits with entrance scanned as completed_flagged
    IF gate_fields_exist THEN
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = philippine_timestamp,
            completed_by = NULL
        WHERE status = 'pending' 
          AND visit_date < philippine_date
          AND gate_entrance_scanned = TRUE
          AND gate_exit_scanned = FALSE;
        
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        total_affected := total_affected + affected_rows;
        result_text := result_text || 'Marked ' || affected_rows || ' visits as completed_flagged' || E'\n';
    END IF;
    
    -- Mark visits without entrance scan as unsuccessful
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = philippine_timestamp,
        completed_by = NULL
    WHERE status = 'pending' 
      AND visit_date < philippine_date
      AND (NOT gate_fields_exist OR gate_entrance_scanned = FALSE);
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    total_affected := total_affected + affected_rows;
    result_text := result_text || 'Marked ' || affected_rows || ' visits as unsuccessful' || E'\n';
    
    result_text := result_text || 'Total affected visits: ' || total_affected || E'\n';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. IMMEDIATE FIX FUNCTION (from migration 20)
-- ============================================================================

-- Create a simple function to immediately fix all pending past visits
CREATE OR REPLACE FUNCTION public.fix_pending_past_visits()
RETURNS TEXT AS $$
DECLARE
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    gate_fields_exist BOOLEAN;
    result_text TEXT := '';
    affected_rows INTEGER := 0;
    total_affected INTEGER := 0;
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
    
    result_text := result_text || 'Fixing pending past visits...' || E'\n';
    result_text := result_text || 'Current date: ' || philippine_date || E'\n';
    result_text := result_text || 'Gate fields exist: ' || gate_fields_exist || E'\n';
    
    -- Step 1: Mark visits with entrance scanned as completed_flagged
    IF gate_fields_exist THEN
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = philippine_timestamp,
            completed_by = NULL
        WHERE status = 'pending' 
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
    WHERE status = 'pending' 
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
    
    -- Show remaining pending visits
    SELECT COUNT(*) INTO affected_rows
    FROM scheduled_visits 
    WHERE status = 'pending';
    
    result_text := result_text || 'Remaining pending visits: ' || affected_rows || E'\n';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
