-- Provides secure access to latest entrance face image by visit ID.
-- Used by personnel face verification flow when direct gate_scans access is restricted by RLS.

CREATE OR REPLACE FUNCTION public.get_latest_entrance_face_image_for_visit(p_visit_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_face_image_data TEXT;
BEGIN
  SELECT gs.face_image_data
  INTO v_face_image_data
  FROM gate_scans gs
  WHERE gs.visit_id = p_visit_id
    AND gs.scan_type = 'entrance'
    AND gs.face_image_data IS NOT NULL
    AND LENGTH(gs.face_image_data) > 0
  ORDER BY gs.scanned_at DESC
  LIMIT 1;

  RETURN v_face_image_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_latest_entrance_face_image_for_visit(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_latest_entrance_face_image_for_visit IS
'Returns latest non-empty entrance face image for a visit. SECURITY DEFINER to support controlled read under RLS.';
