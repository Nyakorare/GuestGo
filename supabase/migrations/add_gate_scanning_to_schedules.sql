-- Add gate scanning functionality to schedules

-- Add gate scanning tracking table
CREATE TABLE IF NOT EXISTS gate_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_id UUID REFERENCES scheduled_visits(id) ON DELETE CASCADE,
    gate_id UUID REFERENCES gates(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scan_type VARCHAR(50) NOT NULL DEFAULT 'entrance', -- 'entrance' or 'exit'
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB, -- For future GPS/location tracking
    UNIQUE(visit_id, gate_id, scan_type) -- Prevent duplicate scans of same type
);

-- Add gate_entrance_scanned column to scheduled_visits table
ALTER TABLE scheduled_visits 
ADD COLUMN IF NOT EXISTS gate_entrance_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gate_entrance_scanned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gate_entrance_scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add gate entrance scan action to log_action enum
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_entrance_scan';

-- Create function to scan gate entrance for a visit
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
    
    -- Check if gate entrance is already scanned for this visit
    IF visit_record.gate_entrance_scanned THEN
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
    
    -- Insert gate scan record
    INSERT INTO gate_scans (
        visit_id, 
        gate_id, 
        scanned_by, 
        scan_type, 
        ip_address, 
        user_agent, 
        location_data
    )
    VALUES (
        p_visit_id, 
        p_gate_id, 
        p_scanned_by, 
        'entrance', 
        p_ip_address, 
        p_user_agent, 
        p_location_data
    );
    
    -- Update visit record to mark gate entrance as scanned
    UPDATE scheduled_visits 
    SET 
        gate_entrance_scanned = TRUE,
        gate_entrance_scanned_at = public.get_philippine_timestamp(),
        gate_entrance_scanned_by = p_scanned_by
    WHERE id = p_visit_id;
    
    -- Get names for logging
    gate_name := gate_record.name;
    visitor_name := visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name;
    
    -- Log the gate entrance scan
    log_id := public.log_action(
        p_scanned_by,
        'gate_entrance_scan',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'visitor_name', visitor_name,
            'visitor_email', visit_record.visitor_email,
            'visit_date', visit_record.visit_date,
            'scanned_at', public.get_philippine_timestamp(),
            'ip_address', p_ip_address,
            'user_agent', p_user_agent,
            'location_data', p_location_data
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if gate entrance is scanned for a visit
CREATE OR REPLACE FUNCTION public.is_gate_entrance_scanned(p_visit_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM scheduled_visits 
        WHERE id = p_visit_id AND gate_entrance_scanned = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get gate scan history for a visit
CREATE OR REPLACE FUNCTION public.get_visit_gate_scans(p_visit_id UUID)
RETURNS TABLE (
    id UUID,
    gate_id UUID,
    gate_name VARCHAR(255),
    gate_location VARCHAR(255),
    scan_type VARCHAR(50),
    scanned_at TIMESTAMP WITH TIME ZONE,
    scanned_by UUID,
    scanner_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.id,
        gs.gate_id,
        g.name as gate_name,
        g.location as gate_location,
        gs.scan_type,
        gs.scanned_at,
        gs.scanned_by,
        CONCAT(ur.first_name, ' ', ur.last_name) as scanner_name
    FROM gate_scans gs
    JOIN gates g ON gs.gate_id = g.id
    LEFT JOIN user_roles ur ON gs.scanned_by = ur.user_id
    WHERE gs.visit_id = p_visit_id
    ORDER BY gs.scanned_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all open gates for scanning
CREATE OR REPLACE FUNCTION public.get_open_gates_for_scanning()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    gate_type gate_type,
    status gate_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.gate_type,
        g.status
    FROM gates g
    WHERE g.status = 'open' 
      AND g.gate_type IN ('entrance', 'both')
    ORDER BY g.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the complete_visit function to require gate entrance scan for today's visits
CREATE OR REPLACE FUNCTION public.complete_visit(
    p_visit_id UUID,
    p_completed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    personnel_role user_role;
    visit_record RECORD;
    place_record RECORD;
    log_row RECORD;
    new_history JSONB;
    place_names TEXT[] := '{}';
    place_name TEXT;
    philippine_date DATE;
    gate_scan_required BOOLEAN := FALSE;
BEGIN
    -- Check if the user completing is personnel
    SELECT role INTO personnel_role FROM user_roles WHERE user_id = p_completed_by;
    IF personnel_role != 'personnel' THEN
        RAISE EXCEPTION 'Only personnel can complete visits';
    END IF;
    
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Check if visit is already completed
    IF visit_record.status = 'completed' THEN
        RAISE EXCEPTION 'Visit is already completed';
    END IF;
    
    -- Get current Philippine date
    philippine_date := public.get_philippine_date();
    
    -- Check if gate entrance scan is required (for today's visits)
    IF visit_record.visit_date = philippine_date THEN
        gate_scan_required := TRUE;
        
        -- Check if gate entrance has been scanned
        IF NOT visit_record.gate_entrance_scanned THEN
            RAISE EXCEPTION 'Gate entrance must be scanned before completing today''s visit';
        END IF;
    END IF;
    
    -- Get all places for this visit
    FOR place_record IN 
        SELECT svp.*, ptv.name as place_name
        FROM scheduled_visit_places svp
        LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
        WHERE svp.visit_id = p_visit_id
    LOOP
        -- Check if personnel is assigned to this place
        IF NOT EXISTS (
            SELECT 1 FROM place_personnel 
            WHERE place_id = place_record.place_id AND personnel_id = p_completed_by
        ) THEN
            RAISE EXCEPTION 'Personnel is not assigned to place: %', place_record.place_name;
        END IF;
        
        -- Mark place as completed if not already
        IF place_record.status != 'completed' THEN
            UPDATE scheduled_visit_places 
            SET 
                status = 'completed',
                completed_at = public.get_philippine_timestamp(),
                completed_by = p_completed_by
            WHERE visit_id = p_visit_id AND place_id = place_record.place_id;
            
            place_names := array_append(place_names, place_record.place_name);
        END IF;
    END LOOP;
    
    -- Mark the entire visit as completed
    UPDATE scheduled_visits 
    SET 
        status = 'completed',
        completed_at = public.get_philippine_timestamp(),
        completed_by = p_completed_by
    WHERE id = p_visit_id;
    
    -- Update the log entry
    SELECT * INTO log_row FROM logs WHERE details->>'visit_id' = p_visit_id::text AND action = 'visit_scheduled' ORDER BY created_at LIMIT 1;
    
    IF log_row.id IS NOT NULL THEN
        new_history := (log_row.details->'history') || jsonb_build_array(
            jsonb_build_object(
                'event', 'completed',
                'timestamp', public.get_philippine_timestamp(),
                'details', jsonb_build_object(
                    'by', p_completed_by,
                    'completed_places', place_names,
                    'total_places', array_length(place_names, 1),
                    'gate_entrance_required', gate_scan_required,
                    'gate_entrance_scanned', visit_record.gate_entrance_scanned
                )
            )
        );
        
        -- Update the log entry with history and current_status
        UPDATE logs SET details = jsonb_set(
            jsonb_set(log_row.details, '{history}', new_history),
            '{current_status}',
            '"completed"'
        ) WHERE id = log_row.id;
    ELSE
        -- Create new log entry for visits without existing logs
        PERFORM public.log_action(
            p_completed_by,
            'visit_completed',
            jsonb_build_object(
                'visit_id', p_visit_id,
                'visitor_name', visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name,
                'visitor_email', visit_record.visitor_email,
                'visitor_role', visit_record.visitor_role,
                'visit_date', visit_record.visit_date,
                'purpose', visit_record.purpose,
                'is_guest', visit_record.visitor_role = 'guest',
                'completed_at', public.get_philippine_timestamp(),
                'completed_by', p_completed_by,
                'completed_places', place_names,
                'total_places', array_length(place_names, 1),
                'gate_entrance_required', gate_scan_required,
                'gate_entrance_scanned', visit_record.gate_entrance_scanned,
                'note', 'Visit was scheduled as guest or log entry was missing'
            )
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the complete_visit_place function to require gate entrance scan for today's visits
CREATE OR REPLACE FUNCTION public.complete_visit_place(
    p_visit_id UUID,
    p_place_id UUID,
    p_completed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    personnel_role user_role;
    visit_record RECORD;
    place_record RECORD;
    all_places_completed BOOLEAN;
    log_row RECORD;
    new_history JSONB;
    place_name TEXT;
    philippine_date DATE;
    gate_scan_required BOOLEAN := FALSE;
BEGIN
    -- Check if the user completing is personnel
    SELECT role INTO personnel_role FROM user_roles WHERE user_id = p_completed_by;
    IF personnel_role != 'personnel' THEN
        RAISE EXCEPTION 'Only personnel can complete visits';
    END IF;
    
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Get place details
    SELECT * INTO place_record FROM scheduled_visit_places WHERE visit_id = p_visit_id AND place_id = p_place_id;
    IF place_record.id IS NULL THEN
        RAISE EXCEPTION 'Place not found in this visit';
    END IF;
    
    -- Check if place is already completed
    IF place_record.status = 'completed' THEN
        RAISE EXCEPTION 'This place has already been completed';
    END IF;
    
    -- Check if personnel is assigned to this place
    IF NOT EXISTS (
        SELECT 1 FROM place_personnel 
        WHERE place_id = p_place_id AND personnel_id = p_completed_by
    ) THEN
        RAISE EXCEPTION 'Personnel is not assigned to this place';
    END IF;
    
    -- Get current Philippine date
    philippine_date := public.get_philippine_date();
    
    -- Check if gate entrance scan is required (for today's visits)
    IF visit_record.visit_date = philippine_date THEN
        gate_scan_required := TRUE;
        
        -- Check if gate entrance has been scanned
        IF NOT visit_record.gate_entrance_scanned THEN
            RAISE EXCEPTION 'Gate entrance must be scanned before completing today''s visit';
        END IF;
    END IF;
    
    -- Mark the specific place as completed
    UPDATE scheduled_visit_places 
    SET 
        status = 'completed',
        completed_at = public.get_philippine_timestamp(),
        completed_by = p_completed_by
    WHERE visit_id = p_visit_id AND place_id = p_place_id;
    
    -- Get place name for logging
    SELECT name INTO place_name FROM places_to_visit WHERE id = p_place_id;
    
    -- Check if all places in this visit are now completed
    SELECT COUNT(*) = 0 INTO all_places_completed
    FROM scheduled_visit_places 
    WHERE visit_id = p_visit_id AND status != 'completed';
    
    -- If all places are completed, mark the entire visit as completed
    IF all_places_completed THEN
        UPDATE scheduled_visits 
        SET 
            status = 'completed',
            completed_at = public.get_philippine_timestamp(),
            completed_by = p_completed_by
        WHERE id = p_visit_id;
    END IF;
    
    -- Update the log entry
    SELECT * INTO log_row FROM logs WHERE details->>'visit_id' = p_visit_id::text AND action = 'visit_scheduled' ORDER BY created_at LIMIT 1;
    
    IF log_row.id IS NOT NULL THEN
        new_history := (log_row.details->'history') || jsonb_build_array(
            jsonb_build_object(
                'event', 'place_completed',
                'timestamp', public.get_philippine_timestamp(),
                'details', jsonb_build_object(
                    'by', p_completed_by,
                    'place_id', p_place_id,
                    'place_name', place_name,
                    'all_places_completed', all_places_completed,
                    'gate_entrance_required', gate_scan_required,
                    'gate_entrance_scanned', visit_record.gate_entrance_scanned
                )
            )
        );
        
        -- Update the log entry with history and current_status if all places are completed
        IF all_places_completed THEN
            UPDATE logs SET details = jsonb_set(
                jsonb_set(log_row.details, '{history}', new_history),
                '{current_status}',
                '"completed"'
            ) WHERE id = log_row.id;
        ELSE
            UPDATE logs SET details = jsonb_set(log_row.details, '{history}', new_history) WHERE id = log_row.id;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gate_scans_visit_id ON gate_scans(visit_id);
CREATE INDEX IF NOT EXISTS idx_gate_scans_gate_id ON gate_scans(gate_id);
CREATE INDEX IF NOT EXISTS idx_gate_scans_scanned_at ON gate_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_gate_entrance ON scheduled_visits(gate_entrance_scanned, visit_date); 