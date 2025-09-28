-- Add role change logging functionality
-- This migration adds role change tracking to the existing logging system

-- Note: 'role_change' should already exist in the log_action enum
-- If it doesn't exist, add it manually: ALTER TYPE log_action ADD VALUE 'role_change';

-- Create function to change user role with logging (admin only)
CREATE OR REPLACE FUNCTION public.change_user_role(
    p_target_user_id UUID,
    p_new_role user_role,
    p_changed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    old_role user_role;
    target_user_first_name VARCHAR(100);
    target_user_last_name VARCHAR(100);
    target_user_email VARCHAR(255);
    admin_user_first_name VARCHAR(100);
    admin_user_last_name VARCHAR(100);
    admin_user_email VARCHAR(255);
    log_id UUID;
BEGIN
    -- Check if the user changing the role is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_changed_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
    
    -- Get the current role and info of the target user
    SELECT role, first_name, last_name, email 
    INTO old_role, target_user_first_name, target_user_last_name, target_user_email
    FROM user_roles 
    WHERE user_id = p_target_user_id;
    
    -- Check if target user exists
    IF old_role IS NULL THEN
        RAISE EXCEPTION 'Target user not found';
    END IF;
    
    -- Don't allow changing to the same role
    IF old_role = p_new_role THEN
        RAISE EXCEPTION 'User already has the specified role';
    END IF;
    
    -- Get admin user info for logging
    SELECT first_name, last_name, email 
    INTO admin_user_first_name, admin_user_last_name, admin_user_email
    FROM user_roles 
    WHERE user_id = p_changed_by;
    
    -- Update the user role
    UPDATE user_roles 
    SET 
        role = p_new_role,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_target_user_id;
    
    -- Log the role change action
    log_id := public.log_action(
        p_changed_by,
        'role_change',
        jsonb_build_object(
            'target_user_id', p_target_user_id,
            'target_user_name', COALESCE(target_user_first_name || ' ' || target_user_last_name, 'Unknown'),
            'target_user_email', COALESCE(target_user_email, 'Unknown'),
            'old_role', old_role,
            'new_role', p_new_role,
            'admin_user_id', p_changed_by,
            'admin_user_name', COALESCE(admin_user_first_name || ' ' || admin_user_last_name, 'Unknown'),
            'admin_user_email', COALESCE(admin_user_email, 'Unknown'),
            'changed_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get role change history for a specific user
CREATE OR REPLACE FUNCTION public.get_user_role_history(
    p_user_id UUID,
    p_requested_by UUID
)
RETURNS TABLE (
    id UUID,
    action log_action,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    admin_user_id UUID,
    admin_user_name TEXT
) AS $$
DECLARE
    requester_role user_role;
BEGIN
    -- Check if the requester is an admin
    SELECT role INTO requester_role 
    FROM user_roles 
    WHERE user_id = p_requested_by;
    
    IF requester_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view role change history';
    END IF;
    
    RETURN QUERY
    SELECT 
        l.id,
        l.action,
        l.details,
        l.created_at,
        l.user_id as admin_user_id,
        COALESCE(
            (l.details->>'admin_user_name'),
            'Unknown Admin'
        ) as admin_user_name
    FROM logs l
    WHERE l.action = 'role_change'
    AND (
        l.details->>'target_user_id' = p_user_id::text
        OR l.details->>'admin_user_id' = p_user_id::text
    )
    ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all role change history (admin only)
CREATE OR REPLACE FUNCTION public.get_all_role_change_history(
    p_requested_by UUID
)
RETURNS TABLE (
    id UUID,
    action log_action,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    admin_user_id UUID,
    admin_user_name TEXT
) AS $$
DECLARE
    requester_role user_role;
BEGIN
    -- Check if the requester is an admin
    SELECT role INTO requester_role 
    FROM user_roles 
    WHERE user_id = p_requested_by;
    
    IF requester_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view all role change history';
    END IF;
    
    RETURN QUERY
    SELECT 
        l.id,
        l.action,
        l.details,
        l.created_at,
        l.user_id as admin_user_id,
        COALESCE(
            (l.details->>'admin_user_name'),
            'Unknown Admin'
        ) as admin_user_name
    FROM logs l
    WHERE l.action = 'role_change'
    ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
