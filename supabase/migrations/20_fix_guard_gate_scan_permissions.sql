-- Fix guard permissions for gate_scans table
-- This migration updates the RLS policy to allow guards to insert gate scan records

-- Update the existing policy to include 'guard' role
DROP POLICY IF EXISTS "Guards can insert gate scans with face images" ON gate_scans;

CREATE POLICY "Guards can insert gate scans with face images" ON gate_scans
    FOR INSERT WITH CHECK (
        scanned_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'log', 'personnel', 'guard')
        )
    );

-- Also create a guard-specific function for inserting gate scans with face data
CREATE OR REPLACE FUNCTION public.insert_guard_gate_scan_with_face(
    p_visit_id UUID,
    p_gate_id UUID,
    p_guard_id UUID,
    p_scan_type VARCHAR(50),
    p_face_image_data TEXT DEFAULT NULL,
    p_face_detection_confidence FLOAT DEFAULT NULL,
    p_face_detection_metadata JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_location_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    scan_id UUID;
    guard_role TEXT;
BEGIN
    -- Verify the user is a guard
    SELECT role INTO guard_role FROM user_roles WHERE user_id = p_guard_id;
    IF guard_role != 'guard' THEN
        RAISE EXCEPTION 'Only guards can use this function';
    END IF;

    -- Insert or update the gate scan record with face data
    INSERT INTO gate_scans (
        visit_id,
        gate_id,
        scanned_by,
        scan_type,
        face_image_data,
        face_detection_confidence,
        face_detection_metadata,
        ip_address,
        user_agent,
        location_data
    )
    VALUES (
        p_visit_id,
        p_gate_id,
        p_guard_id,
        p_scan_type,
        p_face_image_data,
        p_face_detection_confidence,
        p_face_detection_metadata,
        p_ip_address,
        p_user_agent,
        p_location_data
    )
    ON CONFLICT (visit_id, gate_id, scan_type) 
    DO UPDATE SET
        scanned_by = EXCLUDED.scanned_by,
        face_image_data = EXCLUDED.face_image_data,
        face_detection_confidence = EXCLUDED.face_detection_confidence,
        face_detection_metadata = EXCLUDED.face_detection_metadata,
        ip_address = EXCLUDED.ip_address,
        user_agent = EXCLUDED.user_agent,
        location_data = EXCLUDED.location_data,
        scanned_at = CURRENT_TIMESTAMP
    RETURNING id INTO scan_id;

    RETURN scan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_guard_gate_scan_with_face TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION insert_guard_gate_scan_with_face IS 'Allows guards to insert or update gate scan records with face data, bypassing RLS restrictions. Uses UPSERT logic to handle existing records.';
