-- Fix scan_gate_entrance_with_face to support temporary_exit re-entry logic
-- This migration updates the face detection gate scanning function to handle
-- temporary_exit status visits properly, allowing re-entry after temporary exit

CREATE OR REPLACE FUNCTION scan_gate_entrance_with_face(
    p_visit_id UUID,
    p_gate_id UUID,
    p_scanned_by UUID,
    p_face_image_data TEXT DEFAULT NULL,
    p_face_detection_confidence FLOAT DEFAULT NULL,
    p_face_detection_metadata JSONB DEFAULT NULL,
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
    -- Check if the user scanning is a visitor
    SELECT role INTO user_role_record FROM user_roles WHERE user_id = p_scanned_by;
    IF user_role_record.role != 'visitor' THEN
        RAISE EXCEPTION 'Only visitors can scan gate entrances';
    END IF;
    
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Get gate details
    SELECT * INTO gate_record FROM gates WHERE id = p_gate_id;
    IF gate_record.id IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- If entrance already scanned but status is temporary_exit, allow re-entry
    was_temporary_exit := (visit_record.status = 'temporary_exit');
    IF visit_record.gate_entrance_scanned AND NOT was_temporary_exit THEN
        RAISE EXCEPTION 'Gate entrance already scanned for this visit';
    END IF;
    
    -- Check if gate is open
    IF gate_record.status != 'open' THEN
        RAISE EXCEPTION 'Gate is not open for scanning';
    END IF;
    
    -- Check if gate type allows entrance
    IF gate_record.gate_type NOT IN ('entrance', 'both') THEN
        RAISE EXCEPTION 'This gate does not allow entrance scanning';
    END IF;
    
    -- Get gate name for logging
    gate_name := gate_record.name;
    
    -- Get visitor name from scheduled_visits table (since user_profiles might not exist)
    visitor_name := COALESCE(
        (visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name),
        visit_record.visitor_email
    );
    
    -- Insert gate scan record for first-time entrance; on re-entry, update existing face data
    IF NOT visit_record.gate_entrance_scanned THEN
        INSERT INTO gate_scans (
            visit_id, 
            gate_id, 
            scanned_by, 
            scan_type, 
            ip_address, 
            user_agent, 
            location_data,
            face_image_data,
            face_detection_confidence,
            face_detection_metadata
        )
        VALUES (
            p_visit_id, 
            p_gate_id, 
            p_scanned_by, 
            'entrance', 
            p_ip_address, 
            p_user_agent, 
            p_location_data,
            p_face_image_data,
            p_face_detection_confidence,
            p_face_detection_metadata
        );
    ELSIF was_temporary_exit THEN
        -- Update existing face data for temporary_exit re-entry
        UPDATE gate_scans 
        SET 
            face_image_data = p_face_image_data,
            face_detection_confidence = p_face_detection_confidence,
            face_detection_metadata = p_face_detection_metadata,
            scanned_at = public.get_philippine_timestamp()
        WHERE id = (
            SELECT id FROM gate_scans 
            WHERE visit_id = p_visit_id 
              AND gate_id = p_gate_id 
              AND scan_type = 'entrance'
            ORDER BY scanned_at DESC
            LIMIT 1
        );
    END IF;
    
    -- Mark entrance scanned and resume status if coming from temporary_exit
    UPDATE scheduled_visits 
    SET 
        gate_entrance_scanned = TRUE,
        gate_entrance_scanned_at = COALESCE(gate_entrance_scanned_at, public.get_philippine_timestamp()),
        gate_entrance_scanned_by = COALESCE(gate_entrance_scanned_by, p_scanned_by),
        status = CASE 
            WHEN was_temporary_exit THEN COALESCE(previous_status, 'pending')
            WHEN status = 'pending' THEN 'in_progress'
            ELSE status
        END,
        previous_status = CASE WHEN was_temporary_exit THEN NULL ELSE previous_status END
    WHERE id = p_visit_id;
    
    -- Log the gate scan activity
    INSERT INTO activity_logs (
        user_id,
        action,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_scanned_by,
        'gate_entrance_scanned',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'visitor_name', visitor_name,
            'face_detection_used', p_face_image_data IS NOT NULL,
            'face_detection_confidence', p_face_detection_confidence,
            'reentry', was_temporary_exit,
            'previous_status', CASE WHEN was_temporary_exit THEN visit_record.previous_status ELSE NULL END
        ),
        p_ip_address,
        p_user_agent
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        INSERT INTO activity_logs (
            user_id,
            action,
            details,
            ip_address,
            user_agent
        ) VALUES (
            p_scanned_by,
            'gate_entrance_scan_failed',
            jsonb_build_object(
                'visit_id', p_visit_id,
                'gate_id', p_gate_id,
                'error_message', SQLERRM,
                'was_temporary_exit', was_temporary_exit
            ),
            p_ip_address,
            p_user_agent
        );
        
        -- Re-raise the exception
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION scan_gate_entrance_with_face TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION scan_gate_entrance_with_face IS 'Scans a gate entrance with face detection data, supporting temporary_exit re-entry logic';
