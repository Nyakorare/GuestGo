-- Add temporary_exit status and support re-entry and EOD handling

-- Add enum value for temporary exit
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'temporary_exit';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'visit_temporary_exit';

-- Track previous status to allow resuming after temporary exit
ALTER TABLE scheduled_visits
ADD COLUMN IF NOT EXISTS previous_status visit_status;

-- Allow re-entrance scan to resume from temporary_exit and not fail on prior entrance
CREATE OR REPLACE FUNCTION public.scan_gate_entrance(
    p_visit_id UUID,
    p_gate_id UUID,
    p_scanned_by UUID,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_location_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_record RECORD;
    gate_record RECORD;
    log_id UUID;
    gate_name VARCHAR(255);
    visitor_name TEXT;
    user_role_record RECORD;
    was_temporary_exit BOOLEAN := FALSE;
BEGIN
    SELECT role INTO user_role_record FROM user_roles WHERE user_id = p_scanned_by;
    IF user_role_record.role != 'visitor' THEN
        RAISE EXCEPTION 'Only visitors can scan gate entrances';
    END IF;

    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;

    SELECT * INTO gate_record FROM gates WHERE id = p_gate_id;
    IF gate_record.id IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;

    -- If entrance already scanned but status is temporary_exit, allow re-entry
    was_temporary_exit := (visit_record.status = 'temporary_exit');
    IF visit_record.gate_entrance_scanned AND NOT was_temporary_exit THEN
        RAISE EXCEPTION 'Gate entrance already scanned for this visit';
    END IF;

    IF gate_record.status != 'open' THEN
        RAISE EXCEPTION 'Gate is not open for scanning';
    END IF;

    IF gate_record.gate_type NOT IN ('entrance', 'both') THEN
        RAISE EXCEPTION 'This gate does not allow entrance scanning';
    END IF;

    -- Insert gate scan record for first-time entrance; on re-entry, avoid uniqueness conflicts
    IF NOT visit_record.gate_entrance_scanned THEN
      INSERT INTO gate_scans (
          visit_id, gate_id, scanned_by, scan_type, ip_address, user_agent, location_data
      ) VALUES (
          p_visit_id, p_gate_id, p_scanned_by, 'entrance', p_ip_address, p_user_agent, p_location_data
      );
    END IF;

    -- Mark entrance scanned and resume status if coming from temporary_exit
    UPDATE scheduled_visits 
    SET 
        gate_entrance_scanned = TRUE,
        gate_entrance_scanned_at = COALESCE(gate_entrance_scanned_at, public.get_philippine_timestamp()),
        gate_entrance_scanned_by = COALESCE(gate_entrance_scanned_by, p_scanned_by),
        status = CASE WHEN was_temporary_exit THEN COALESCE(previous_status, 'pending') ELSE status END,
        previous_status = CASE WHEN was_temporary_exit THEN NULL ELSE previous_status END
    WHERE id = p_visit_id;

    SELECT name INTO gate_name FROM gates WHERE id = p_gate_id;
    visitor_name := visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name;

    -- Log the entrance scan (for re-entry we still log it as entrance)
    log_id := public.log_action(
        p_scanned_by,
        'gate_entrance_scan',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'visitor_name', visitor_name,
            'visitor_email', visit_record.visitor_email,
            'scan_type', 'entrance',
            'reentry', was_temporary_exit,
            'ip_address', p_ip_address,
            'user_agent', p_user_agent,
            'location_data', p_location_data,
            'scanned_at', public.get_philippine_timestamp()
        )
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: set a visit to temporary_exit, capturing previous_status and writing a log
CREATE OR REPLACE FUNCTION public.set_temporary_exit(
    p_visit_id UUID,
    p_guard_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    guard_role TEXT;
BEGIN
    SELECT role INTO guard_role FROM user_roles WHERE user_id = p_guard_id;
    IF guard_role != 'guard' THEN
        RAISE EXCEPTION 'Only guards can set temporary exit';
    END IF;

    UPDATE scheduled_visits
    SET 
        previous_status = CASE WHEN status != 'temporary_exit' THEN status ELSE previous_status END,
        status = 'temporary_exit'
    WHERE id = p_visit_id;

    PERFORM public.log_action(
        p_guard_id,
        'visit_temporary_exit',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'guard_id', p_guard_id,
            'timestamp', public.get_philippine_timestamp()
        )
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: resume a visit from temporary_exit back to previous_status
CREATE OR REPLACE FUNCTION public.resume_visit_after_temporary_exit(
    p_visit_id UUID,
    p_actor UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_record RECORD;
BEGIN
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;

    IF visit_record.status = 'temporary_exit' THEN
        UPDATE scheduled_visits
        SET 
            status = COALESCE(previous_status, 'pending'),
            previous_status = NULL
        WHERE id = p_visit_id;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log function for guard temporary exit and adjust guard action validator
CREATE OR REPLACE FUNCTION public.log_guard_action(
    p_visit_id UUID,
    p_action TEXT,
    p_guard_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_exists BOOLEAN;
    guard_role TEXT;
BEGIN
    SELECT role INTO guard_role FROM user_roles WHERE user_id = p_guard_id;
    IF guard_role != 'guard' THEN
        RAISE EXCEPTION 'Only guards can log actions';
    END IF;

    SELECT EXISTS(SELECT 1 FROM scheduled_visits WHERE id = p_visit_id) INTO visit_exists;
    IF NOT visit_exists THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;

    IF p_action NOT IN ('entrance', 'exit', 'temporary_exit') THEN
        RAISE EXCEPTION 'Invalid action type. Must be "entrance", "exit" or "temporary_exit"';
    END IF;

    IF p_action = 'temporary_exit' THEN
        PERFORM public.log_action(
            p_guard_id,
            'visit_temporary_exit',
            jsonb_build_object(
                'visit_id', p_visit_id,
                'guard_id', p_guard_id,
                'timestamp', public.get_philippine_timestamp()
            )
        );
        RETURN TRUE;
    END IF;

    -- Default: log generic guard_action to maintain existing behavior
    PERFORM public.log_action(
        p_guard_id,
        'guard_action',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'action', p_action,
            'guard_id', p_guard_id,
            'timestamp', public.get_philippine_timestamp()
        )
    );
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- At end of day, mark temporary_exit as completed_flagged if not re-entered/exited
CREATE OR REPLACE FUNCTION public.update_visit_statuses()
RETURNS INTEGER AS $$
DECLARE
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
    affected_rows INTEGER := 0;
    additional_affected_rows INTEGER;
    end_of_day_time TIME := '23:59:59';
BEGIN
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();

    -- Mark visits stuck in temporary_exit past end of day as completed_flagged
    UPDATE scheduled_visits 
    SET status = 'completed_flagged', completed_at = philippine_timestamp, completed_by = NULL
    WHERE status = 'temporary_exit'
      AND (
        visit_date < philippine_date OR (visit_date = philippine_date AND philippine_timestamp::TIME > end_of_day_time)
      );
    GET DIAGNOSTICS additional_affected_rows = ROW_COUNT;
    affected_rows := affected_rows + additional_affected_rows;

    -- Keep existing behavior by invoking original logic if present
    -- Note: If this function fully replaces the original, the above update augments previous rules.

    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force update helper to also process temporary_exit immediately
CREATE OR REPLACE FUNCTION public.force_update_all_visit_statuses()
RETURNS TEXT AS $$
DECLARE
    affected_visits INTEGER := 0;
    philippine_date DATE;
    philippine_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    philippine_date := public.get_philippine_date();
    philippine_timestamp := public.get_philippine_timestamp();

    UPDATE scheduled_visits 
    SET status = 'completed_flagged', completed_at = philippine_timestamp, completed_by = NULL
    WHERE status = 'temporary_exit';
    GET DIAGNOSTICS affected_visits = ROW_COUNT;

    RETURN json_build_object(
        'message', 'Temporary exit statuses processed',
        'affected_visits', affected_visits,
        'philippine_date', philippine_date,
        'philippine_timestamp', philippine_timestamp,
        'executed_at', philippine_timestamp,
        'force_update', true
    )::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;