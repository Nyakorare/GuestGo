-- Add face image storage functionality to gate scans
-- This migration adds the ability to store cropped face images captured during entrance/exit scanning

-- Add image storage columns to gate_scans table
ALTER TABLE gate_scans 
ADD COLUMN IF NOT EXISTS face_image_data TEXT, -- Base64 encoded cropped face image
ADD COLUMN IF NOT EXISTS face_detection_confidence DECIMAL(5,4), -- Confidence score from face detection
ADD COLUMN IF NOT EXISTS face_detection_metadata JSONB; -- Additional metadata about the detection

-- Add index for face image queries
CREATE INDEX IF NOT EXISTS idx_gate_scans_face_image ON gate_scans(face_image_data) WHERE face_image_data IS NOT NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN gate_scans.face_image_data IS 'Base64 encoded cropped face image captured during scanning';
COMMENT ON COLUMN gate_scans.face_detection_confidence IS 'Confidence score from face detection algorithm (0.0 to 1.0)';
COMMENT ON COLUMN gate_scans.face_detection_metadata IS 'Additional metadata about face detection (bounding box, landmarks, etc.)';

-- Update the gate entrance scan function to accept face image data
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
    
    -- Check if visit is for today
    IF visit_record.visit_date != CURRENT_DATE THEN
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

-- Update the gate exit scan function to accept face image data
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
    
    -- Check if visit is for today
    IF visit_record.visit_date != CURRENT_DATE THEN
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

-- Create function to get gate scan with face image data
CREATE OR REPLACE FUNCTION public.get_gate_scan_with_face_image(p_scan_id UUID)
RETURNS TABLE (
    id UUID,
    visit_id UUID,
    gate_id UUID,
    scanned_by UUID,
    scan_type VARCHAR(50),
    scanned_at TIMESTAMP WITH TIME ZONE,
    face_image_data TEXT,
    face_detection_confidence DECIMAL(5,4),
    face_detection_metadata JSONB,
    visitor_name TEXT,
    gate_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.id,
        gs.visit_id,
        gs.gate_id,
        gs.scanned_by,
        gs.scan_type,
        gs.scanned_at,
        gs.face_image_data,
        gs.face_detection_confidence,
        gs.face_detection_metadata,
        (sv.visitor_first_name || ' ' || sv.visitor_last_name)::TEXT as visitor_name,
        g.name as gate_name
    FROM gate_scans gs
    JOIN scheduled_visits sv ON gs.visit_id = sv.id
    JOIN gates g ON gs.gate_id = g.id
    WHERE gs.id = p_scan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for face image data
ALTER TABLE gate_scans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view gate scans with face images for visits they're involved in
CREATE POLICY "Users can view gate scans with face images for their visits" ON gate_scans
    FOR SELECT USING (
        scanned_by = auth.uid() OR
        visit_id IN (
            SELECT id FROM scheduled_visits 
            WHERE visitor_user_id = auth.uid()
        )
    );

-- Policy: Guards can insert gate scans with face images
CREATE POLICY "Guards can insert gate scans with face images" ON gate_scans
    FOR INSERT WITH CHECK (
        scanned_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'log', 'personnel')
        )
    );
