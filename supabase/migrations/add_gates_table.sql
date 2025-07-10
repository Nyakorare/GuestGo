-- Add gates functionality to the database

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
    gate_type gate_type NOT NULL DEFAULT 'both',
    status gate_status NOT NULL DEFAULT 'closed',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add gate-related actions to the log_action enum
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_create';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_update';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'gate_status_change';

-- Create function to create a gate (admin only)
CREATE OR REPLACE FUNCTION public.create_gate(
    p_name VARCHAR(255),
    p_created_by UUID,
    p_description TEXT DEFAULT NULL,
    p_location VARCHAR(255) DEFAULT NULL,
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
    INSERT INTO gates (name, description, location, gate_type, created_by)
    VALUES (p_name, p_description, p_location, p_gate_type, p_created_by)
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
    
    IF old_status IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Don't update if status is the same
    IF old_status = p_status THEN
        RETURN TRUE;
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
    p_updated_by UUID,
    p_name VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_location VARCHAR(255) DEFAULT NULL,
    p_gate_type gate_type DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    old_gate RECORD;
    log_id UUID;
BEGIN
    -- Check if the user updating is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_updated_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update gates';
    END IF;
    
    -- Get current gate details
    SELECT * INTO old_gate
    FROM gates 
    WHERE id = p_gate_id;
    
    IF old_gate.id IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Update the gate (only update provided fields)
    UPDATE gates 
    SET 
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        location = COALESCE(p_location, location),
        gate_type = COALESCE(p_gate_type, gate_type),
        updated_at = public.get_philippine_timestamp(),
        updated_by = p_updated_by
    WHERE id = p_gate_id;
    
    -- Log the gate update
    log_id := public.log_action(
        p_updated_by,
        'gate_update',
        jsonb_build_object(
            'gate_id', p_gate_id,
            'old_name', old_gate.name,
            'new_name', COALESCE(p_name, old_gate.name),
            'old_description', old_gate.description,
            'new_description', COALESCE(p_description, old_gate.description),
            'old_location', old_gate.location,
            'new_location', COALESCE(p_location, old_gate.location),
            'old_gate_type', old_gate.gate_type,
            'new_gate_type', COALESCE(p_gate_type, old_gate.gate_type),
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
    gate_type gate_type,
    status gate_status,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    creator_name TEXT,
    updater_name TEXT
) AS $$
DECLARE
    admin_role user_role;
BEGIN
    -- Check if the user is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_user_id;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view gates';
    END IF;
    
    RETURN QUERY
    SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.gate_type,
        g.status,
        g.created_by,
        g.created_at,
        g.updated_at,
        g.updated_by,
        CONCAT(ur1.first_name, ' ', ur1.last_name) as creator_name,
        CONCAT(ur2.first_name, ' ', ur2.last_name) as updater_name
    FROM gates g
    LEFT JOIN user_roles ur1 ON g.created_by = ur1.user_id
    LEFT JOIN user_roles ur2 ON g.updated_by = ur2.user_id
    ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get a specific gate by ID (admin only)
CREATE OR REPLACE FUNCTION public.get_gate_by_id(p_gate_id UUID, p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    gate_type gate_type,
    status gate_status,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID,
    creator_name TEXT,
    updater_name TEXT
) AS $$
DECLARE
    admin_role user_role;
BEGIN
    -- Check if the user is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_user_id;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view gates';
    END IF;
    
    RETURN QUERY
    SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.gate_type,
        g.status,
        g.created_by,
        g.created_at,
        g.updated_at,
        g.updated_by,
        CONCAT(ur1.first_name, ' ', ur1.last_name) as creator_name,
        CONCAT(ur2.first_name, ' ', ur2.last_name) as updater_name
    FROM gates g
    LEFT JOIN user_roles ur1 ON g.created_by = ur1.user_id
    LEFT JOIN user_roles ur2 ON g.updated_by = ur2.user_id
    WHERE g.id = p_gate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete a gate (admin only)
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
    SELECT name INTO gate_name
    FROM gates 
    WHERE id = p_gate_id;
    
    IF gate_name IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;
    
    -- Delete the gate
    DELETE FROM gates WHERE id = p_gate_id;
    
    -- Log the gate deletion
    log_id := public.log_action(
        p_deleted_by,
        'gate_update', -- Reusing gate_update for deletion
        jsonb_build_object(
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'action', 'deleted',
            'deleted_at', public.get_philippine_timestamp()
        )
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 