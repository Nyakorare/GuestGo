-- Add comprehensive gate functionality to the database

-- Drop existing gates table and related objects if they exist
DROP TABLE IF EXISTS gates CASCADE;
DROP TYPE IF EXISTS gate_type CASCADE;
DROP TYPE IF EXISTS gate_status CASCADE;

-- Create enum for gate types
CREATE TYPE gate_type AS ENUM ('entrance', 'exit', 'both');

-- Create enum for gate status
CREATE TYPE gate_status AS ENUM ('open', 'closed');

-- Create gates table
CREATE TABLE gates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
    gate_type gate_type NOT NULL DEFAULT 'both',
    status gate_status NOT NULL DEFAULT 'closed',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

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

-- Add gate-related actions to the log_action enum
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_create';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_update';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_status_change';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_entrance_scan';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_exit_scan';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'visit_flagged_no_exit';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'visit_place_completed';

-- Add 'in_progress' status to visit_status enum
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'in_progress';

-- Add gate scanning columns to scheduled_visits table
ALTER TABLE scheduled_visits 
ADD COLUMN IF NOT EXISTS gate_entrance_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gate_entrance_scanned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gate_entrance_scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS gate_exit_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gate_exit_scanned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gate_exit_scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS flagged_for_no_exit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop existing gate management functions if they exist to avoid signature conflicts
DROP FUNCTION IF EXISTS public.create_gate(VARCHAR, UUID, TEXT, VARCHAR, TEXT, gate_type);
DROP FUNCTION IF EXISTS public.update_gate_status(UUID, gate_status, UUID);
DROP FUNCTION IF EXISTS public.update_gate(UUID, VARCHAR, TEXT, VARCHAR, TEXT, gate_type, UUID);
DROP FUNCTION IF EXISTS public.get_all_gates(UUID);
DROP FUNCTION IF EXISTS public.get_gate_by_id(UUID, UUID);
DROP FUNCTION IF EXISTS public.delete_gate(UUID, UUID);

-- Create function to create a gate (admin only)
CREATE OR REPLACE FUNCTION public.create_gate(
    p_name VARCHAR(255),
    p_created_by UUID,
    p_description TEXT DEFAULT NULL,
    p_location VARCHAR(255) DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_gate_type gate_type DEFAULT 'both'
)
RETURNS UUID AS $$
DECLARE
    gate_id UUID;
    admin_role user_role;
    log_id UUID;
BEGIN
    -- Check if the user creating is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_created_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can create gates';
    END IF;
    
    -- Validate required fields
    IF p_name IS NULL OR p_name = '' THEN
        RAISE EXCEPTION 'Gate name is required';
    END IF;
    
    -- Insert the gate
    INSERT INTO gates (name, description, location, image_url, gate_type, created_by)
    VALUES (p_name, p_description, p_location, p_image_url, p_gate_type, p_created_by)
    RETURNING id INTO gate_id;
    
    -- Log the gate creation
    log_id := public.log_action(
        p_created_by,
        'gate_create',
        jsonb_build_object(
            'gate_id', gate_id,
            'gate_name', p_name,
            'gate_description', p_description,
            'gate_location', p_location,
            'gate_image_url', p_image_url,
            'gate_type', p_gate_type,
            'status', 'closed',
            'created_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN gate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update gate status (admin only)
CREATE OR REPLACE FUNCTION public.update_gate_status(
    p_gate_id UUID,
    p_status gate_status,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    old_status gate_status;
    gate_name VARCHAR(255);
    log_id UUID;
BEGIN
    -- Check if the user updating is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_updated_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update gate status';
    END IF;
    
    -- Get current status and gate name
    SELECT status, name INTO old_status, gate_name 
    FROM gates 
    WHERE id = p_gate_id;
    
    IF gate_name IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Update the gate status
    UPDATE gates 
    SET 
        status = p_status,
        updated_at = public.get_philippine_timestamp(),
        updated_by = p_updated_by
    WHERE id = p_gate_id;
    
    -- Log the status change
    log_id := public.log_action(
        p_updated_by,
        'gate_status_change',
        jsonb_build_object(
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'old_status', old_status,
            'new_status', p_status,
            'updated_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update gate details (admin only)
CREATE OR REPLACE FUNCTION public.update_gate(
    p_gate_id UUID,
    p_name VARCHAR(255),
    p_description TEXT,
    p_location VARCHAR(255),
    p_image_url TEXT,
    p_gate_type gate_type,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    old_gate_name VARCHAR(255);
    log_id UUID;
BEGIN
    -- Check if the user updating is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_updated_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update gates';
    END IF;
    
    -- Get old gate name for logging
    SELECT name INTO old_gate_name FROM gates WHERE id = p_gate_id;
    
    IF old_gate_name IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Update the gate
    UPDATE gates 
    SET 
        name = p_name,
        description = p_description,
        location = p_location,
        image_url = p_image_url,
        gate_type = p_gate_type,
        updated_at = public.get_philippine_timestamp(),
        updated_by = p_updated_by
    WHERE id = p_gate_id;
    
    -- Log the gate update
    log_id := public.log_action(
        p_updated_by,
        'gate_update',
        jsonb_build_object(
            'gate_id', p_gate_id,
            'old_name', old_gate_name,
            'new_name', p_name,
            'description', p_description,
            'location', p_location,
            'image_url', p_image_url,
            'gate_type', p_gate_type,
            'updated_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all gates (admin only)
CREATE OR REPLACE FUNCTION public.get_all_gates(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
    gate_type gate_type,
    status gate_status,
    created_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID
) AS $$
DECLARE
    user_role_record user_role;
BEGIN
    -- Check if the user is an admin
    SELECT role INTO user_role_record 
    FROM user_roles 
    WHERE user_id = p_user_id;
    
    IF user_role_record != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view all gates';
    END IF;
    
    RETURN QUERY
    SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.image_url,
        g.gate_type,
        g.status,
        g.created_at,
        g.created_by,
        g.updated_at,
        g.updated_by
    FROM gates g
    ORDER BY g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get gate by ID (admin only)
CREATE OR REPLACE FUNCTION public.get_gate_by_id(p_gate_id UUID, p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
    gate_type gate_type,
    status gate_status,
    created_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID
) AS $$
DECLARE
    user_role_record user_role;
BEGIN
    -- Check if the user is an admin
    SELECT role INTO user_role_record 
    FROM user_roles 
    WHERE user_id = p_user_id;
    
    IF user_role_record != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view gate details';
    END IF;
    
    RETURN QUERY
    SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.image_url,
        g.gate_type,
        g.status,
        g.created_at,
        g.created_by,
        g.updated_at,
        g.updated_by
    FROM gates g
    WHERE g.id = p_gate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete gate (admin only)
CREATE OR REPLACE FUNCTION public.delete_gate(
    p_gate_id UUID,
    p_deleted_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    gate_name VARCHAR(255);
    log_id UUID;
BEGIN
    -- Check if the user deleting is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_deleted_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can delete gates';
    END IF;
    
    -- Get gate name for logging
    SELECT name INTO gate_name FROM gates WHERE id = p_gate_id;
    
    IF gate_name IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Delete the gate
    DELETE FROM gates WHERE id = p_gate_id;
    
    -- Log the gate deletion
    log_id := public.log_action(
        p_deleted_by,
        'gate_delete',
        jsonb_build_object(
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'deleted_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing functions if they exist to avoid signature conflicts
DROP FUNCTION IF EXISTS public.scan_gate_entrance(UUID, UUID, UUID, INET, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.scan_gate_exit(UUID, UUID, UUID, INET, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.is_gate_entrance_scanned(UUID);
DROP FUNCTION IF EXISTS public.is_gate_exit_scanned(UUID);
DROP FUNCTION IF EXISTS public.get_open_gates_for_scanning();
DROP FUNCTION IF EXISTS public.get_open_exit_gates_for_scanning();
DROP FUNCTION IF EXISTS public.flag_visits_without_exit_scans();
DROP FUNCTION IF EXISTS public.manual_flag_visits_without_exit_scans(UUID);

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
    
    -- Get gate name and visitor name for logging
    SELECT name INTO gate_name FROM gates WHERE id = p_gate_id;
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
            'scan_type', 'entrance',
            'ip_address', p_ip_address,
            'user_agent', p_user_agent,
            'location_data', p_location_data,
            'scanned_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to scan gate exit for a visit (visitor only)
CREATE OR REPLACE FUNCTION public.scan_gate_exit(
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
        RAISE EXCEPTION 'Only visitors can scan gate exits';
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
    
    -- Check if gate exit is already scanned for this visit
    IF visit_record.gate_exit_scanned THEN
        RAISE EXCEPTION 'Gate exit already scanned for this visit';
    END IF;
    
    -- Check if gate is open
    IF gate_record.status != 'open' THEN
        RAISE EXCEPTION 'Gate is not open for scanning';
    END IF;
    
    -- Check if gate type allows exit
    IF gate_record.gate_type NOT IN ('exit', 'both') THEN
        RAISE EXCEPTION 'This gate does not allow exit scanning';
    END IF;
    
    -- Check if visit is pending (visitor should scan exit to complete the visit)
    IF visit_record.status != 'pending' THEN
        RAISE EXCEPTION 'Visit must be pending before scanning gate exit';
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
        'exit', 
        p_ip_address, 
        p_user_agent, 
        p_location_data
    );
    
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
    
    -- Get gate name and visitor name for logging
    SELECT name INTO gate_name FROM gates WHERE id = p_gate_id;
    visitor_name := visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name;
    
    -- Log the gate exit scan
    log_id := public.log_action(
        p_scanned_by,
        'gate_exit_scan',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'visitor_name', visitor_name,
            'visitor_email', visit_record.visitor_email,
            'scan_type', 'exit',
            'ip_address', p_ip_address,
            'user_agent', p_user_agent,
            'location_data', p_location_data,
            'scanned_at', public.get_philippine_timestamp(),
            'visit_completed', true
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

-- Create function to check if gate exit is scanned for a visit
CREATE OR REPLACE FUNCTION public.is_gate_exit_scanned(p_visit_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM scheduled_visits 
        WHERE id = p_visit_id AND gate_exit_scanned = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists to avoid signature conflicts
DROP FUNCTION IF EXISTS public.get_visit_gate_scans(UUID);

-- Create function to get all gate scans for a visit
CREATE OR REPLACE FUNCTION public.get_visit_gate_scans(p_visit_id UUID)
RETURNS TABLE (
    id UUID,
    gate_id UUID,
    gate_name VARCHAR(255),
    scan_type VARCHAR(50),
    scanned_at TIMESTAMP WITH TIME ZONE,
    scanned_by UUID,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.id,
        gs.gate_id,
        g.name as gate_name,
        gs.scan_type,
        gs.scanned_at,
        gs.scanned_by,
        gs.ip_address,
        gs.user_agent,
        gs.location_data
    FROM gate_scans gs
    LEFT JOIN gates g ON gs.gate_id = g.id
    WHERE gs.visit_id = p_visit_id
    ORDER BY gs.scanned_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get open gates for scanning
CREATE OR REPLACE FUNCTION public.get_open_gates_for_scanning()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
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
        g.image_url,
        g.gate_type,
        g.status
    FROM gates g
    WHERE g.status = 'open'
    ORDER BY g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get open exit gates for scanning
CREATE OR REPLACE FUNCTION public.get_open_exit_gates_for_scanning()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
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
        g.image_url,
        g.gate_type,
        g.status
    FROM gates g
    WHERE g.status = 'open' AND g.gate_type IN ('exit', 'both')
    ORDER BY g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to flag visits without exit scans at end of day
CREATE OR REPLACE FUNCTION public.flag_visits_without_exit_scans()
RETURNS INTEGER AS $$
DECLARE
    flagged_count INTEGER := 0;
    visit_record RECORD;
    philippine_date DATE;
    log_id UUID;
    visitor_name TEXT;
BEGIN
    -- Get current Philippine date
    philippine_date := public.get_philippine_date();
    
    -- Find visits that are pending, have entrance scanned, but no exit scan
    FOR visit_record IN 
        SELECT * FROM scheduled_visits 
        WHERE visit_date = philippine_date 
          AND status = 'pending' 
          AND gate_entrance_scanned = TRUE
          AND gate_exit_scanned = FALSE
          AND flagged_for_no_exit = FALSE
    LOOP
        -- Flag the visit for no exit scan
        UPDATE scheduled_visits 
        SET 
            flagged_for_no_exit = TRUE,
            flagged_at = public.get_philippine_timestamp(),
            flagged_by = NULL -- System action
        WHERE id = visit_record.id;
        
        -- Get visitor name for logging
        visitor_name := visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name;
        
        -- Log the flagging
        log_id := public.log_action(
            NULL, -- System action
            'visit_flagged_no_exit',
            jsonb_build_object(
                'visit_id', visit_record.id,
                'visitor_name', visitor_name,
                'visitor_email', visit_record.visitor_email,
                'visit_date', visit_record.visit_date,
                'flagged_at', public.get_philippine_timestamp(),
                'reason', 'Visitor did not scan exit gate by end of day'
            )
        );
        
        flagged_count := flagged_count + 1;
    END LOOP;
    
    RETURN flagged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to manually flag visits without exit scans (admin only)
CREATE OR REPLACE FUNCTION public.manual_flag_visits_without_exit_scans(p_admin_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    admin_role user_role;
    flagged_count INTEGER;
BEGIN
    -- Check if the user is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_admin_user_id;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can manually flag visits';
    END IF;
    
    -- Call the automatic flagging function
    flagged_count := public.flag_visits_without_exit_scans();
    
    RETURN flagged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing visit completion functions if they exist to avoid signature conflicts
DROP FUNCTION IF EXISTS public.complete_visit(UUID, UUID);
DROP FUNCTION IF EXISTS public.complete_visit_place(UUID, UUID, UUID);

-- Create function to complete visit (updated to handle gate scanning)
CREATE OR REPLACE FUNCTION public.complete_visit(
    p_visit_id UUID,
    p_completed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_record RECORD;
    personnel_role user_role;
    log_id UUID;
    visitor_name TEXT;
    place_details JSONB;
    total_places INTEGER;
    completed_places INTEGER;
BEGIN
    -- Check if the user completing is personnel
    SELECT role INTO personnel_role 
    FROM user_roles 
    WHERE user_id = p_completed_by;
    
    IF personnel_role NOT IN ('personnel', 'admin') THEN
        RAISE EXCEPTION 'Only personnel can complete visits';
    END IF;
    
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Check if visit is already completed
    IF visit_record.status IN ('completed', 'completed_flagged') THEN
        RAISE EXCEPTION 'Visit is already completed';
    END IF;
    
    -- Check if all places are completed
    SELECT COUNT(*) INTO total_places FROM scheduled_visit_places WHERE visit_id = p_visit_id;
    SELECT COUNT(*) INTO completed_places FROM scheduled_visit_places WHERE visit_id = p_visit_id AND status = 'completed';
    
    IF total_places > 0 AND completed_places < total_places THEN
        RAISE EXCEPTION 'Cannot complete visit: not all places are completed';
    END IF;
    
    -- Get place details for logging
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'place_id', svp.place_id,
                'place_name', ptv.name,
                'place_location', ptv.location,
                'status', svp.status,
                'completed_at', svp.completed_at,
                'completed_by', svp.completed_by
            )
        ) INTO place_details
    FROM scheduled_visit_places svp
    LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
    WHERE svp.visit_id = p_visit_id;
    
    -- Determine visit status based on gate exit scan
    IF visit_record.gate_exit_scanned THEN
        -- Visitor scanned exit, mark as completed
        UPDATE scheduled_visits 
        SET 
            status = 'completed',
            completed_at = public.get_philippine_timestamp(),
            completed_by = p_completed_by
        WHERE id = p_visit_id;
    ELSE
        -- No exit scan, mark as completed_flagged
        UPDATE scheduled_visits 
        SET 
            status = 'completed_flagged',
            completed_at = public.get_philippine_timestamp(),
            completed_by = p_completed_by
        WHERE id = p_visit_id;
    END IF;
    
    -- Get visitor name for logging
    visitor_name := visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name;
    
    -- Log the visit completion
    log_id := public.log_action(
        p_completed_by,
        'visit_completed',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'visitor_name', visitor_name,
            'visitor_email', visit_record.visitor_email,
            'visitor_role', visit_record.visitor_role,
            'visit_date', visit_record.visit_date,
            'purpose', visit_record.purpose,
            'is_guest', visit_record.visitor_role = 'guest',
            'completed_at', public.get_philippine_timestamp(),
            'completed_by', p_completed_by,
            'status', CASE WHEN visit_record.gate_exit_scanned THEN 'completed' ELSE 'completed_flagged' END,
            'places', place_details,
            'total_places', total_places,
            'completed_places', completed_places,
            'gate_exit_scanned', visit_record.gate_exit_scanned,
            'note', CASE 
                WHEN visit_record.gate_exit_scanned THEN 'Visit completed normally'
                ELSE 'Visit completed (flagged) - personnel finished their part but visitor did not scan exit'
            END
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to complete visit place (updated to handle gate scanning)
CREATE OR REPLACE FUNCTION public.complete_visit_place(
    p_visit_id UUID,
    p_place_id UUID,
    p_completed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    visit_record RECORD;
    place_record RECORD;
    personnel_role user_role;
    log_id UUID;
    visitor_name TEXT;
    place_name VARCHAR(255);
    total_places INTEGER;
    completed_places INTEGER;
    new_completed_places INTEGER;
BEGIN
    -- Check if the user completing is personnel
    SELECT role INTO personnel_role 
    FROM user_roles 
    WHERE user_id = p_completed_by;
    
    IF personnel_role NOT IN ('personnel', 'admin') THEN
        RAISE EXCEPTION 'Only personnel can complete visit places';
    END IF;
    
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    IF visit_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Get place details
    SELECT * INTO place_record FROM scheduled_visit_places WHERE visit_id = p_visit_id AND place_id = p_place_id;
    IF place_record.id IS NULL THEN
        RAISE EXCEPTION 'Visit place not found';
    END IF;
    
    -- Check if place is already completed
    IF place_record.status = 'completed' THEN
        RAISE EXCEPTION 'Visit place is already completed';
    END IF;
    
    -- Update the place status
    UPDATE scheduled_visit_places 
    SET 
        status = 'completed',
        completed_at = public.get_philippine_timestamp(),
        completed_by = p_completed_by
    WHERE visit_id = p_visit_id AND place_id = p_place_id;
    
    -- Get place name and visitor name for logging
    SELECT name INTO place_name FROM places_to_visit WHERE id = p_place_id;
    visitor_name := visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name;
    
    -- Get completion statistics
    SELECT COUNT(*) INTO total_places FROM scheduled_visit_places WHERE visit_id = p_visit_id;
    SELECT COUNT(*) INTO completed_places FROM scheduled_visit_places WHERE visit_id = p_visit_id AND status = 'completed';
    new_completed_places := completed_places + 1;
    
    -- Log the place completion
    log_id := public.log_action(
        p_completed_by,
        'visit_place_completed',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'place_id', p_place_id,
            'place_name', place_name,
            'visitor_name', visitor_name,
            'visitor_email', visit_record.visitor_email,
            'completed_at', public.get_philippine_timestamp(),
            'completed_by', p_completed_by,
            'total_places', total_places,
            'completed_places', new_completed_places,
            'remaining_places', total_places - new_completed_places
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gate_scans_visit_id ON gate_scans(visit_id);
CREATE INDEX IF NOT EXISTS idx_gate_scans_gate_id ON gate_scans(gate_id);
CREATE INDEX IF NOT EXISTS idx_gate_scans_scanned_at ON gate_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_gate_scans_scan_type ON gate_scans(scan_type, scanned_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_gate_entrance ON scheduled_visits(gate_entrance_scanned, visit_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_gate_exit ON scheduled_visits(gate_exit_scanned, visit_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_flagged_no_exit ON scheduled_visits(flagged_for_no_exit, visit_date); 