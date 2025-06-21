-- Drop existing tables if they exist
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS place_personnel CASCADE;
DROP TABLE IF EXISTS personnel_availability CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS places_to_visit CASCADE;

-- Drop the enum type if it exists
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS log_action CASCADE;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'log', 'personnel', 'visitor', 'guest');

-- Create enum for log actions
CREATE TYPE log_action AS ENUM ('password_change', 'place_update', 'place_availability_toggle', 'place_create', 'personnel_assignment', 'personnel_removal', 'personnel_availability_change');

-- Create places_to_visit table
CREATE TABLE places_to_visit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'visitor',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create place_personnel table to connect places to personnel
CREATE TABLE place_personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id UUID REFERENCES places_to_visit(id) ON DELETE CASCADE,
    personnel_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(place_id, personnel_id)
);

-- Create personnel_availability table to track personnel availability status
CREATE TABLE personnel_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    personnel_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places_to_visit(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    unavailability_reason TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(personnel_id, place_id)
);

-- Create logs table
CREATE TABLE logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action log_action NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to set default role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, first_name, last_name)
    VALUES (
        NEW.id, 
        'visitor',
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set default role
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to log actions
CREATE OR REPLACE FUNCTION public.log_action(
    p_user_id UUID,
    p_action log_action,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.logs (user_id, action, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a place is available (has assigned personnel)
CREATE OR REPLACE FUNCTION public.is_place_available(p_place_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM place_personnel 
        WHERE place_id = p_place_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign personnel to a place (admin only)
CREATE OR REPLACE FUNCTION public.assign_personnel_to_place(
    p_place_id UUID,
    p_personnel_id UUID,
    p_assigned_by UUID
)
RETURNS UUID AS $$
DECLARE
    assignment_id UUID;
    admin_role user_role;
BEGIN
    -- Check if the user assigning is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_assigned_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can assign personnel to places';
    END IF;
    
    -- Check if the personnel user has personnel role
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_personnel_id;
    
    IF admin_role != 'personnel' THEN
        RAISE EXCEPTION 'User must have personnel role to be assigned to a place';
    END IF;
    
    -- Insert the assignment
    INSERT INTO place_personnel (place_id, personnel_id, assigned_by)
    VALUES (p_place_id, p_personnel_id, p_assigned_by)
    ON CONFLICT (place_id, personnel_id) DO NOTHING
    RETURNING id INTO assignment_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove personnel from a place (admin only)
CREATE OR REPLACE FUNCTION public.remove_personnel_from_place(
    p_place_id UUID,
    p_personnel_id UUID,
    p_removed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
BEGIN
    -- Check if the user removing is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_removed_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can remove personnel from places';
    END IF;
    
    -- Delete the assignment
    DELETE FROM place_personnel 
    WHERE place_id = p_place_id AND personnel_id = p_personnel_id;
    
    -- Also delete availability record
    DELETE FROM personnel_availability 
    WHERE place_id = p_place_id AND personnel_id = p_personnel_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update personnel availability
CREATE OR REPLACE FUNCTION public.update_personnel_availability(
    p_personnel_id UUID,
    p_place_id UUID,
    p_is_available BOOLEAN,
    p_unavailability_reason TEXT DEFAULT NULL,
    p_updated_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    availability_id UUID;
    personnel_role user_role;
BEGIN
    -- Check if the user updating is the personnel themselves
    IF p_updated_by != p_personnel_id THEN
        RAISE EXCEPTION 'Personnel can only update their own availability';
    END IF;
    
    -- Check if the personnel user has personnel role
    SELECT role INTO personnel_role 
    FROM user_roles 
    WHERE user_id = p_personnel_id;
    
    IF personnel_role != 'personnel' THEN
        RAISE EXCEPTION 'User must have personnel role to update availability';
    END IF;
    
    -- Check if personnel is assigned to this place
    IF NOT EXISTS (
        SELECT 1 FROM place_personnel 
        WHERE place_id = p_place_id AND personnel_id = p_personnel_id
    ) THEN
        RAISE EXCEPTION 'Personnel is not assigned to this place';
    END IF;
    
    -- Insert or update availability record
    INSERT INTO personnel_availability (personnel_id, place_id, is_available, unavailability_reason, updated_by)
    VALUES (p_personnel_id, p_place_id, p_is_available, p_unavailability_reason, p_updated_by)
    ON CONFLICT (personnel_id, place_id) 
    DO UPDATE SET 
        is_available = EXCLUDED.is_available,
        unavailability_reason = EXCLUDED.unavailability_reason,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = EXCLUDED.updated_by
    RETURNING id INTO availability_id;
    
    RETURN availability_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get personnel availability
CREATE OR REPLACE FUNCTION public.get_personnel_availability(p_personnel_id UUID)
RETURNS TABLE (
    place_id UUID,
    place_name VARCHAR(255),
    place_description TEXT,
    place_location VARCHAR(255),
    is_available BOOLEAN,
    unavailability_reason TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as place_id,
        p.name as place_name,
        p.description as place_description,
        p.location as place_location,
        COALESCE(pa.is_available, true) as is_available,
        pa.unavailability_reason,
        pp.assigned_at,
        COALESCE(pa.updated_at, pp.assigned_at) as updated_at
    FROM place_personnel pp
    JOIN places_to_visit p ON pp.place_id = p.id
    LEFT JOIN personnel_availability pa ON pp.place_id = pa.place_id AND pp.personnel_id = pa.personnel_id
    WHERE pp.personnel_id = p_personnel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to automatically create availability record when personnel is assigned
CREATE OR REPLACE FUNCTION public.handle_personnel_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default availability record (available by default)
    INSERT INTO personnel_availability (personnel_id, place_id, is_available, updated_by)
    VALUES (NEW.personnel_id, NEW.place_id, true, NEW.assigned_by)
    ON CONFLICT (personnel_id, place_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create availability record
CREATE TRIGGER on_personnel_assigned
    AFTER INSERT ON place_personnel
    FOR EACH ROW EXECUTE FUNCTION public.handle_personnel_assignment();

-- Insert some sample places
INSERT INTO places_to_visit (name, description, location) VALUES
    ('Main Office', 'Company headquarters', 'New York'),
    ('Branch Office', 'Regional office', 'Los Angeles'),
    ('Training Center', 'Employee training facility', 'Chicago'),
    ('Research Lab', 'Research and development center', 'Boston'),
    ('Customer Service Center', 'Customer support office', 'Miami'); 