-- Fix date validation in gate scan functions to use Philippine timezone
-- This migration fixes the "Visit is not scheduled for today" error by using
-- the proper Philippine date function instead of CURRENT_DATE

-- Update the gate entrance scan function to use Philippine date
CREATE OR REPLACE FUNCTION public.scan_gate_entrance(
    p_visit_id UUID,
    p_gate_id UUID,
    p_scanned_by UUID,
    p_face_image_data TEXT DEFAULT NULL,
    p_face_detection_confidence DECIMAL(5,4) DEFAULT NULL,
    p_face_detection_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_record RECORD;
    gate_record RECORD;
    scan_id UUID;
BEGIN
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Check if visit is for today (using Philippine timezone)
    IF visit_record.visit_date != public.get_philippine_date() THEN
        RAISE EXCEPTION 'Visit is not scheduled for today';
    END IF;
    
    -- Check if gate entrance is already scanned for this visit
    IF visit_record.gate_entrance_scanned THEN
        RAISE EXCEPTION 'Gate entrance already scanned for this visit';
    END IF;
    
    -- Get gate details
    SELECT * INTO gate_record FROM gates WHERE id = p_gate_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Check if gate allows entrance scanning
    IF gate_record.gate_type NOT IN ('entrance', 'both') THEN
        RAISE EXCEPTION 'This gate does not allow entrance scanning';
    END IF;
    
    -- Insert gate scan record with face image data
    INSERT INTO gate_scans (
        visit_id, 
        gate_id, 
        scanned_by, 
        scan_type, 
        face_image_data,
        face_detection_confidence,
        face_detection_metadata
    )
    VALUES (
        p_visit_id, 
        p_gate_id, 
        p_scanned_by, 
        'entrance',
        p_face_image_data,
        p_face_detection_confidence,
        p_face_detection_metadata
    )
    RETURNING id INTO scan_id;
    
    -- Update visit record to mark gate entrance as scanned
    UPDATE scheduled_visits 
    SET 
        gate_entrance_scanned = TRUE,
        gate_entrance_scanned_at = public.get_philippine_timestamp(),
        gate_entrance_scanned_by = p_scanned_by
    WHERE id = p_visit_id;
    
    -- Log the gate entrance scan
    PERFORM public.log_action(
        p_scanned_by,
        'gate_entrance_scan',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'gate_id', p_gate_id,
            'scan_id', scan_id,
            'visitor_name', visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name,
            'visitor_email', visit_record.visitor_email,
            'has_face_image', p_face_image_data IS NOT NULL,
            'face_detection_confidence', p_face_detection_confidence,
            'scanned_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the gate exit scan function to use Philippine date
CREATE OR REPLACE FUNCTION public.scan_gate_exit(
    p_visit_id UUID,
    p_gate_id UUID,
    p_scanned_by UUID,
    p_face_image_data TEXT DEFAULT NULL,
    p_face_detection_confidence DECIMAL(5,4) DEFAULT NULL,
    p_face_detection_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_record RECORD;
    gate_record RECORD;
    scan_id UUID;
BEGIN
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Check if visit is for today (using Philippine timezone)
    IF visit_record.visit_date != public.get_philippine_date() THEN
        RAISE EXCEPTION 'Visit is not scheduled for today';
    END IF;
    
    -- Check if gate exit is already scanned for this visit
    IF visit_record.gate_exit_scanned THEN
        RAISE EXCEPTION 'Gate exit already scanned for this visit';
    END IF;
    
    -- Check if entrance was scanned first
    IF NOT visit_record.gate_entrance_scanned THEN
        RAISE EXCEPTION 'Gate entrance must be scanned before exit';
    END IF;
    
    -- Get gate details
    SELECT * INTO gate_record FROM gates WHERE id = p_gate_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Check if gate allows exit scanning
    IF gate_record.gate_type NOT IN ('exit', 'both') THEN
        RAISE EXCEPTION 'This gate does not allow exit scanning';
    END IF;
    
    -- Insert gate scan record with face image data
    INSERT INTO gate_scans (
        visit_id, 
        gate_id, 
        scanned_by, 
        scan_type, 
        face_image_data,
        face_detection_confidence,
        face_detection_metadata
    )
    VALUES (
        p_visit_id, 
        p_gate_id, 
        p_scanned_by, 
        'exit',
        p_face_image_data,
        p_face_detection_confidence,
        p_face_detection_metadata
    )
    RETURNING id INTO scan_id;
    
    -- Update visit record to mark gate exit as scanned and complete the visit
    UPDATE scheduled_visits 
    SET 
        gate_exit_scanned = TRUE,
        gate_exit_scanned_at = public.get_philippine_timestamp(),
        gate_exit_scanned_by = p_scanned_by,
        status = 'completed',
        completed_at = public.get_philippine_timestamp(),
        completed_by = p_scanned_by
    WHERE id = p_visit_id;
    
    -- Log the gate exit scan
    PERFORM public.log_action(
        p_scanned_by,
        'gate_exit_scan',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'gate_id', p_gate_id,
            'scan_id', scan_id,
            'visitor_name', visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name,
            'visitor_email', visit_record.visitor_email,
            'has_face_image', p_face_image_data IS NOT NULL,
            'face_detection_confidence', p_face_detection_confidence,
            'scanned_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
