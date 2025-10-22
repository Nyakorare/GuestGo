-- Immediate fix for pending past visits
-- This is a simplified migration to fix the specific issue

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

-- Create a function to debug a specific visit
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
