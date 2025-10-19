-- Fix face image storage by removing problematic index and optimizing storage
-- This migration addresses the "index row requires 667704 bytes, maximum size is 8191" error

-- Remove the problematic index on face_image_data
DROP INDEX IF EXISTS idx_gate_scans_face_image;

-- Add a comment explaining the change
COMMENT ON COLUMN gate_scans.face_image_data IS 'Encrypted and compressed base64 face image data (no index due to size constraints)';

-- Create a function to get face image data for display (with decryption)
CREATE OR REPLACE FUNCTION public.get_face_image_for_display(p_scan_id UUID)
RETURNS TEXT AS $$
DECLARE
    face_data TEXT;
BEGIN
    -- Get the encrypted face image data
    SELECT face_image_data INTO face_data
    FROM gate_scans
    WHERE id = p_scan_id;
    
    -- Return the data (decryption should be handled on the frontend)
    RETURN face_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a scan has face image data without loading the full data
CREATE OR REPLACE FUNCTION public.has_face_image_data(p_scan_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_face BOOLEAN;
BEGIN
    SELECT (face_image_data IS NOT NULL AND LENGTH(face_image_data) > 0) INTO has_face
    FROM gate_scans
    WHERE id = p_scan_id;
    
    RETURN COALESCE(has_face, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_gate_scan_with_face_image(UUID);

-- Update the get_gate_scan_with_face_image function to handle encrypted data
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
    gate_name VARCHAR(255),
    has_face_image BOOLEAN
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
        g.name as gate_name,
        (gs.face_image_data IS NOT NULL AND LENGTH(gs.face_image_data) > 0) as has_face_image
    FROM gate_scans gs
    JOIN scheduled_visits sv ON gs.visit_id = sv.id
    JOIN gates g ON gs.gate_id = g.id
    WHERE gs.id = p_scan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
