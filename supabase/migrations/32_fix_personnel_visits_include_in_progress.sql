-- Fix get_personnel_scheduled_visits to include 'in_progress' status visits
-- This ensures personnel can see visits that have been scanned at the gate entrance
-- and have transitioned from 'pending' to 'in_progress' status

CREATE OR REPLACE FUNCTION public.get_personnel_scheduled_visits(p_personnel_id UUID)
RETURNS TABLE (
    visit_id UUID,
    visitor_first_name VARCHAR(100),
    visitor_last_name VARCHAR(100),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    visitor_user_id UUID,
    visitor_role user_role,
    visit_date DATE,
    purpose VARCHAR(255),
    other_purpose TEXT,
    status visit_status,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    place_id UUID,
    place_name VARCHAR(255),
    place_description TEXT,
    place_location VARCHAR(255),
    place_status visit_status,
    place_completed_at TIMESTAMP WITH TIME ZONE,
    place_completed_by UUID,
    total_places BIGINT,
    completed_places BIGINT,
    gate_entrance_scanned BOOLEAN,
    gate_entrance_scanned_at TIMESTAMP WITH TIME ZONE,
    gate_entrance_scanned_by UUID,
    gate_exit_scanned BOOLEAN,
    gate_exit_scanned_at TIMESTAMP WITH TIME ZONE,
    gate_exit_scanned_by UUID,
    flagged_for_no_exit BOOLEAN,
    flagged_at TIMESTAMP WITH TIME ZONE,
    flagged_by UUID
) AS $$
DECLARE
    gate_fields_exist BOOLEAN;
BEGIN
    -- Check if gate fields exist in the scheduled_visits table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_visits' 
        AND column_name = 'gate_entrance_scanned'
    ) INTO gate_fields_exist;
    
    -- Return query with conditional gate field selection
    IF gate_fields_exist THEN
        RETURN QUERY
        SELECT 
            sv.id as visit_id,
            sv.visitor_first_name,
            sv.visitor_last_name,
            sv.visitor_email,
            sv.visitor_phone,
            sv.visitor_user_id,
            sv.visitor_role,
            sv.visit_date,
            sv.purpose,
            sv.other_purpose,
            sv.status,
            sv.scheduled_at,
            sv.completed_at,
            sv.completed_by,
            svp.place_id,
            ptv.name as place_name,
            ptv.description as place_description,
            ptv.location as place_location,
            svp.status as place_status,
            svp.completed_at as place_completed_at,
            svp.completed_by as place_completed_by,
            (SELECT COUNT(*) FROM scheduled_visit_places svp2 WHERE svp2.visit_id = sv.id) as total_places,
            (SELECT COUNT(*) FROM scheduled_visit_places svp3 WHERE svp3.visit_id = sv.id AND svp3.status = 'completed') as completed_places,
            sv.gate_entrance_scanned,
            sv.gate_entrance_scanned_at,
            sv.gate_entrance_scanned_by,
            sv.gate_exit_scanned,
            sv.gate_exit_scanned_at,
            sv.gate_exit_scanned_by,
            sv.flagged_for_no_exit,
            sv.flagged_at,
            sv.flagged_by
        FROM scheduled_visits sv
        JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
        WHERE svp.place_id IN (
            SELECT pp.place_id FROM place_personnel pp WHERE pp.personnel_id = p_personnel_id
        )
        AND sv.status IN ('pending', 'in_progress', 'completed', 'completed_flagged', 'temporary_exit')
        ORDER BY sv.visit_date ASC, sv.scheduled_at DESC;
    ELSE
        -- Return query without gate fields
        RETURN QUERY
        SELECT 
            sv.id as visit_id,
            sv.visitor_first_name,
            sv.visitor_last_name,
            sv.visitor_email,
            sv.visitor_phone,
            sv.visitor_user_id,
            sv.visitor_role,
            sv.visit_date,
            sv.purpose,
            sv.other_purpose,
            sv.status,
            sv.scheduled_at,
            sv.completed_at,
            sv.completed_by,
            svp.place_id,
            ptv.name as place_name,
            ptv.description as place_description,
            ptv.location as place_location,
            svp.status as place_status,
            svp.completed_at as place_completed_at,
            svp.completed_by as place_completed_by,
            (SELECT COUNT(*) FROM scheduled_visit_places svp2 WHERE svp2.visit_id = sv.id) as total_places,
            (SELECT COUNT(*) FROM scheduled_visit_places svp3 WHERE svp3.visit_id = sv.id AND svp3.status = 'completed') as completed_places,
            FALSE as gate_entrance_scanned,
            NULL::TIMESTAMP WITH TIME ZONE as gate_entrance_scanned_at,
            NULL::UUID as gate_entrance_scanned_by,
            FALSE as gate_exit_scanned,
            NULL::TIMESTAMP WITH TIME ZONE as gate_exit_scanned_at,
            NULL::UUID as gate_exit_scanned_by,
            FALSE as flagged_for_no_exit,
            NULL::TIMESTAMP WITH TIME ZONE as flagged_at,
            NULL::UUID as flagged_by
        FROM scheduled_visits sv
        JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
        WHERE svp.place_id IN (
            SELECT pp.place_id FROM place_personnel pp WHERE pp.personnel_id = p_personnel_id
        )
        AND sv.status IN ('pending', 'in_progress', 'completed', 'completed_flagged', 'temporary_exit')
        ORDER BY sv.visit_date ASC, sv.scheduled_at DESC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

