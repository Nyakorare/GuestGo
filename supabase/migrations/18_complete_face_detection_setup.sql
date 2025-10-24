-- Complete face detection setup migration
-- This migration creates all necessary tables and functions for face detection integration

-- ============================================================================
-- PART 1: Create activity_logs table for tracking user actions and system events
-- ============================================================================

-- Create activity_logs table for tracking user actions and system events
-- This table stores audit logs for user activities and system events

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Add RLS policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity logs
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: System can insert activity logs (for authenticated users)
DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;
CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add comment explaining the table
COMMENT ON TABLE activity_logs IS 'Stores audit logs for user activities and system events';
COMMENT ON COLUMN activity_logs.user_id IS 'User who performed the action (NULL for system events)';
COMMENT ON COLUMN activity_logs.action IS 'Type of action performed (e.g., gate_entrance_scanned, visit_created)';
COMMENT ON COLUMN activity_logs.details IS 'Additional details about the action in JSON format';
COMMENT ON COLUMN activity_logs.ip_address IS 'IP address of the user when the action was performed';
COMMENT ON COLUMN activity_logs.user_agent IS 'User agent string from the browser';

-- ============================================================================
-- PART 2: Create user_profiles table for user information
-- ============================================================================

-- Create user_profiles table to store user profile information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Add RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and update their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add comment explaining the table
COMMENT ON TABLE user_profiles IS 'Stores user profile information';
COMMENT ON COLUMN user_profiles.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN user_profiles.full_name IS 'Full name of the user';
COMMENT ON COLUMN user_profiles.first_name IS 'First name of the user';
COMMENT ON COLUMN user_profiles.last_name IS 'Last name of the user';
COMMENT ON COLUMN user_profiles.email IS 'Email address of the user';

-- ============================================================================
-- PART 3: Add face detection support to gate scanning
-- ============================================================================

-- Add face detection support to gate scanning
-- This migration adds a new RPC function that includes face data when scanning gate entrances

-- Drop existing function if it exists (to handle parameter type changes)
DROP FUNCTION IF EXISTS scan_gate_entrance_with_face(UUID, UUID, UUID, TEXT, FLOAT, TEXT, INET, TEXT, JSONB);
DROP FUNCTION IF EXISTS scan_gate_entrance_with_face(UUID, UUID, UUID, TEXT, FLOAT, JSONB, INET, TEXT, JSONB);

CREATE OR REPLACE FUNCTION scan_gate_entrance_with_face(
    p_visit_id UUID,
    p_gate_id UUID,
    p_scanned_by UUID,
    p_face_image_data TEXT DEFAULT NULL,
    p_face_detection_confidence FLOAT DEFAULT NULL,
    p_face_detection_metadata JSONB DEFAULT NULL,
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
    
    -- Get gate name for logging
    gate_name := gate_record.name;
    
    -- Get visitor name from scheduled_visits table (since user_profiles might not exist)
    visitor_name := COALESCE(
        (visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name),
        visit_record.visitor_email
    );
    
    -- Insert gate scan record with face data
    INSERT INTO gate_scans (
        visit_id, 
        gate_id, 
        scanned_by, 
        scan_type, 
        ip_address, 
        user_agent, 
        location_data,
        face_image_data,
        face_detection_confidence,
        face_detection_metadata
    )
    VALUES (
        p_visit_id, 
        p_gate_id, 
        p_scanned_by, 
        'entrance', 
        p_ip_address, 
        p_user_agent, 
        p_location_data,
        p_face_image_data,
        p_face_detection_confidence,
        p_face_detection_metadata
    );
    
    -- Update visit record to mark gate entrance as scanned
    UPDATE scheduled_visits 
    SET 
        gate_entrance_scanned = TRUE,
        status = CASE 
            WHEN status = 'pending' THEN 'in_progress'
            ELSE status
        END
    WHERE id = p_visit_id;
    
    -- Log the gate scan activity
    INSERT INTO activity_logs (
        user_id,
        action,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_scanned_by,
        'gate_entrance_scanned',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'visitor_name', visitor_name,
            'face_detection_used', p_face_image_data IS NOT NULL,
            'face_detection_confidence', p_face_detection_confidence
        ),
        p_ip_address,
        p_user_agent
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        INSERT INTO activity_logs (
            user_id,
            action,
            details,
            ip_address,
            user_agent
        ) VALUES (
            p_scanned_by,
            'gate_entrance_scan_failed',
            jsonb_build_object(
                'visit_id', p_visit_id,
                'gate_id', p_gate_id,
                'error_message', SQLERRM
            ),
            p_ip_address,
            p_user_agent
        );
        
        -- Re-raise the exception
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION scan_gate_entrance_with_face TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION scan_gate_entrance_with_face IS 'Scans a gate entrance with optional face detection data for visitor verification';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration creates:
-- 1. activity_logs table for tracking user actions
-- 2. user_profiles table for user information
-- 3. scan_gate_entrance_with_face function for face detection integration
-- 
-- The face detection integration is now ready to use!
-- ============================================================================
