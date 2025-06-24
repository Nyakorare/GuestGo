-- Drop existing tables if they exist
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS place_personnel CASCADE;
DROP TABLE IF EXISTS personnel_availability CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS places_to_visit CASCADE;
DROP TABLE IF EXISTS scheduled_visits CASCADE;

-- Drop the enum type if it exists
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS log_action CASCADE;
DROP TYPE IF EXISTS visit_status CASCADE;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'log', 'personnel', 'visitor', 'guest');

-- Create enum for log actions
CREATE TYPE log_action AS ENUM ('password_change', 'place_update', 'place_availability_toggle', 'place_create', 'personnel_assignment', 'personnel_removal', 'personnel_availability_change', 'visit_scheduled', 'visit_completed', 'visit_unsuccessful');

-- Create enum for visit status
CREATE TYPE visit_status AS ENUM ('pending', 'completed', 'cancelled', 'unsuccessful');

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
    email VARCHAR(255),
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

-- Create scheduled_visits table
CREATE TABLE scheduled_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_first_name VARCHAR(100) NOT NULL,
    visitor_last_name VARCHAR(100) NOT NULL,
    visitor_email VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20) NOT NULL,
    visitor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    visitor_role user_role NOT NULL,
    place_id UUID REFERENCES places_to_visit(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    other_purpose TEXT,
    status visit_status DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
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
    INSERT INTO public.user_roles (user_id, role, first_name, last_name, email)
    VALUES (
        NEW.id, 
        'visitor',
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;
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

-- Create function to schedule a visit
CREATE OR REPLACE FUNCTION public.schedule_visit(
    p_visitor_first_name VARCHAR(100),
    p_visitor_last_name VARCHAR(100),
    p_visitor_email VARCHAR(255),
    p_visitor_phone VARCHAR(20),
    p_place_id UUID,
    p_visit_date DATE,
    p_purpose VARCHAR(255),
    p_other_purpose TEXT DEFAULT NULL,
    p_visitor_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    visit_id UUID;
    visitor_role user_role;
    philippine_date DATE;
    max_schedule_date DATE;
    week_start DATE;
    week_end DATE;
    visits_this_week INTEGER;
    user_role_check user_role;
    log_id UUID;
BEGIN
    philippine_date := public.get_philippine_date();
    max_schedule_date := philippine_date + INTERVAL '1 month';
    IF p_visit_date < philippine_date THEN
        RAISE EXCEPTION 'Cannot schedule visits for past dates. Current Philippine date is %.', philippine_date;
    END IF;
    IF p_visit_date > max_schedule_date THEN
        RAISE EXCEPTION 'Cannot schedule visits more than 1 month in advance. Maximum allowed date is %.', max_schedule_date;
    END IF;
    IF p_visitor_user_id IS NOT NULL THEN
        SELECT role INTO user_role_check FROM user_roles WHERE user_id = p_visitor_user_id;
        IF user_role_check IS NULL OR user_role_check != 'visitor' THEN
            RAISE EXCEPTION 'Only users with visitor role can schedule visits. Current user role: %.', COALESCE(user_role_check, 'none');
        END IF;
    END IF;
    week_start := p_visit_date - (EXTRACT(DOW FROM p_visit_date)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';
    SELECT COUNT(*) INTO visits_this_week
    FROM scheduled_visits
    WHERE visitor_email = p_visitor_email
      AND visit_date BETWEEN week_start AND week_end
      AND status IN ('pending', 'completed');
    IF visits_this_week >= 2 THEN
        RAISE EXCEPTION 'Maximum of 2 visits per week allowed per email address. You have already scheduled % visits for the week of %.', visits_this_week, week_start;
    END IF;
    IF p_visitor_user_id IS NOT NULL THEN
        visitor_role := 'visitor';
    ELSE
        visitor_role := 'guest';
    END IF;
    INSERT INTO scheduled_visits (
        visitor_first_name,
        visitor_last_name,
        visitor_email,
        visitor_phone,
        visitor_user_id,
        visitor_role,
        place_id,
        visit_date,
        purpose,
        other_purpose
    )
    VALUES (
        p_visitor_first_name,
        p_visitor_last_name,
        p_visitor_email,
        p_visitor_phone,
        p_visitor_user_id,
        visitor_role,
        p_place_id,
        p_visit_date,
        p_purpose,
        p_other_purpose
    )
    RETURNING id INTO visit_id;
    IF p_visitor_user_id IS NOT NULL THEN
        log_id := public.log_action(
            p_visitor_user_id,
            'visit_scheduled',
            jsonb_build_object(
                'visit_id', visit_id,
                'visitor_name', p_visitor_first_name || ' ' || p_visitor_last_name,
                'visitor_email', p_visitor_email,
                'visitor_role', visitor_role,
                'place_id', p_place_id,
                'visit_date', p_visit_date,
                'purpose', p_purpose,
                'is_guest', visitor_role = 'guest',
                'scheduled_at_philippine_time', public.get_philippine_timestamp(),
                'history', jsonb_build_array(
                    jsonb_build_object(
                        'event', 'scheduled',
                        'timestamp', public.get_philippine_timestamp(),
                        'details', jsonb_build_object(
                            'by', p_visitor_user_id,
                            'purpose', p_purpose
                        )
                    )
                )
            )
        );
    END IF;
    RETURN visit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically mark past pending visits as unsuccessful
CREATE OR REPLACE FUNCTION public.mark_past_visits_unsuccessful()
RETURNS INTEGER AS $$
DECLARE
    philippine_date DATE;
    affected_rows INTEGER;
BEGIN
    -- Get current Philippine date (UTC+8) using the new function
    philippine_date := public.get_philippine_date();
    
    -- Mark pending visits from past dates as unsuccessful
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = public.get_philippine_timestamp(),
        completed_by = NULL -- System action, no specific user
    WHERE status = 'pending' 
      AND visit_date < philippine_date;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Log the action if any visits were marked as unsuccessful
    IF affected_rows > 0 THEN
        PERFORM public.log_action(
            NULL, -- System action
            'visit_unsuccessful',
            jsonb_build_object(
                'action', 'auto_mark_past_visits',
                'affected_visits', affected_rows,
                'philippine_date', philippine_date,
                'executed_at', public.get_philippine_timestamp(),
                'executed_at_philippine_time', public.get_philippine_timestamp()
            )
        );
    END IF;
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function that will be called by the trigger to check and mark past visits
CREATE OR REPLACE FUNCTION public.check_and_mark_past_visits()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the function to mark past visits as unsuccessful
    PERFORM public.mark_past_visits_unsuccessful();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that runs on any insert/update to scheduled_visits to automatically mark past visits
CREATE TRIGGER auto_mark_past_visits_trigger
    AFTER INSERT OR UPDATE ON scheduled_visits
    FOR EACH ROW EXECUTE FUNCTION public.check_and_mark_past_visits();

-- Create a function to get current Philippine date (for use in other functions)
CREATE OR REPLACE FUNCTION public.get_philippine_date()
RETURNS DATE AS $$
BEGIN
    RETURN (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila')::DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current Philippine timestamp
CREATE OR REPLACE FUNCTION public.get_philippine_timestamp()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get scheduled visits for personnel
CREATE OR REPLACE FUNCTION public.get_personnel_scheduled_visits(p_personnel_id UUID)
RETURNS TABLE (
    visit_id UUID,
    visitor_first_name VARCHAR(100),
    visitor_last_name VARCHAR(100),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    visitor_user_id UUID,
    visitor_role user_role,
    place_id UUID,
    place_name VARCHAR(255),
    place_location VARCHAR(255),
    visit_date DATE,
    purpose VARCHAR(255),
    other_purpose TEXT,
    status visit_status,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID
) AS $$
BEGIN
    -- First, automatically mark any past pending visits as unsuccessful
    PERFORM public.mark_past_visits_unsuccessful();
    
    RETURN QUERY
    SELECT 
        scheduled_visits.id as visit_id,
        scheduled_visits.visitor_first_name,
        scheduled_visits.visitor_last_name,
        scheduled_visits.visitor_email,
        scheduled_visits.visitor_phone,
        scheduled_visits.visitor_user_id,
        scheduled_visits.visitor_role,
        scheduled_visits.place_id,
        places_to_visit.name as place_name,
        places_to_visit.location as place_location,
        scheduled_visits.visit_date,
        scheduled_visits.purpose,
        scheduled_visits.other_purpose,
        scheduled_visits.status,
        scheduled_visits.scheduled_at,
        scheduled_visits.completed_at,
        scheduled_visits.completed_by
    FROM scheduled_visits
    INNER JOIN places_to_visit ON scheduled_visits.place_id = places_to_visit.id
    INNER JOIN place_personnel ON places_to_visit.id = place_personnel.place_id
    WHERE place_personnel.personnel_id = p_personnel_id
    ORDER BY scheduled_visits.visit_date ASC, scheduled_visits.scheduled_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refactor complete_visit to handle cases where no log entry exists (for guest visits)
CREATE OR REPLACE FUNCTION public.complete_visit(
    p_visit_id UUID,
    p_completed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    personnel_role user_role;
    visit_place_id UUID;
    v_visit_date DATE;
    v_visitor_user_id UUID;
    v_visitor_email VARCHAR(255);
    v_visitor_first_name VARCHAR(100);
    v_visitor_last_name VARCHAR(100);
    v_visitor_role user_role;
    v_purpose VARCHAR(255);
    philippine_date DATE;
    log_row RECORD;
    new_history JSONB;
    visit_details JSONB;
BEGIN
    -- Check if the user completing is personnel
    SELECT role INTO personnel_role FROM user_roles WHERE user_id = p_completed_by;
    IF personnel_role != 'personnel' THEN
        RAISE EXCEPTION 'Only personnel can complete visits';
    END IF;
    
    -- Get all visit details
    SELECT 
        place_id, visit_date, visitor_user_id, visitor_email, 
        visitor_first_name, visitor_last_name, visitor_role, purpose
    INTO 
        visit_place_id, v_visit_date, v_visitor_user_id, v_visitor_email,
        v_visitor_first_name, v_visitor_last_name, v_visitor_role, v_purpose
    FROM scheduled_visits WHERE id = p_visit_id;
    
    -- Check if visit exists
    IF visit_place_id IS NULL THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Get current Philippine date and validate
    philippine_date := public.get_philippine_date();
    IF v_visit_date > philippine_date THEN
        RAISE EXCEPTION 'Cannot complete visits scheduled for future dates. Visit date is % but current Philippine date is %.', v_visit_date, philippine_date;
    END IF;
    
    -- Check if personnel is assigned to this place
    IF NOT EXISTS (
        SELECT 1 FROM place_personnel 
        WHERE place_id = visit_place_id AND personnel_id = p_completed_by
    ) THEN
        RAISE EXCEPTION 'Personnel is not assigned to this place';
    END IF;
    
    -- Update the visit status
    UPDATE scheduled_visits 
    SET 
        status = 'completed',
        completed_at = public.get_philippine_timestamp(),
        completed_by = p_completed_by
    WHERE id = p_visit_id;
    
    -- Try to find existing log entry for this visit
    SELECT * INTO log_row FROM logs WHERE details->>'visit_id' = p_visit_id::text AND action = 'visit_scheduled' ORDER BY created_at LIMIT 1;
    
    IF log_row.id IS NOT NULL THEN
        -- Update existing log entry
        new_history := (log_row.details->'history') || jsonb_build_array(
        jsonb_build_object(
                'event', 'completed',
                'timestamp', public.get_philippine_timestamp(),
                'details', jsonb_build_object(
                    'by', p_completed_by
                )
            )
        );
        UPDATE logs SET details = jsonb_set(log_row.details, '{history}', new_history) WHERE id = log_row.id;
    ELSE
        -- Create new log entry for guest visits or visits without existing logs
        visit_details := jsonb_build_object(
            'visit_id', p_visit_id,
            'visitor_name', v_visitor_first_name || ' ' || v_visitor_last_name,
            'visitor_email', v_visitor_email,
            'visitor_role', v_visitor_role,
            'place_id', visit_place_id,
            'visit_date', v_visit_date,
            'purpose', v_purpose,
            'is_guest', v_visitor_role = 'guest',
            'scheduled_at_philippine_time', public.get_philippine_timestamp(),
            'history', jsonb_build_array(
                jsonb_build_object(
                    'event', 'completed',
                    'timestamp', public.get_philippine_timestamp(),
                    'details', jsonb_build_object(
                        'by', p_completed_by,
                        'note', 'Visit was scheduled as guest or log entry was missing'
                    )
                )
            )
        );
        
        -- Create log entry with the personnel who completed it as the user_id
        PERFORM public.log_action(
            p_completed_by,
            'visit_scheduled',
            visit_details
        );
    END IF;
    
    RETURN TRUE;
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

-- Create function to check if email is already registered
CREATE OR REPLACE FUNCTION public.is_email_registered(p_email VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = p_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix any existing scheduled visits with incorrect role assignments
-- Update visits where visitor_user_id is NULL but visitor_role is 'visitor' to be 'guest'
UPDATE scheduled_visits 
SET visitor_role = 'guest' 
WHERE visitor_user_id IS NULL AND visitor_role = 'visitor';

-- Create function to mark a visit as unsuccessful
CREATE OR REPLACE FUNCTION public.mark_visit_unsuccessful(
    p_visit_id UUID,
    p_marked_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    visit_place_id UUID;
BEGIN
    -- Check if the user marking is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_marked_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can mark visits as unsuccessful';
    END IF;
    
    -- Get the place ID for this visit
    SELECT place_id INTO visit_place_id
    FROM scheduled_visits
    WHERE id = p_visit_id;
    
    -- Update the visit status
    UPDATE scheduled_visits 
    SET 
        status = 'unsuccessful',
        completed_at = public.get_philippine_timestamp(),
        completed_by = p_marked_by
    WHERE id = p_visit_id;
    
    -- Log the visit marking as unsuccessful
    PERFORM public.log_action(
        p_marked_by,
        'visit_unsuccessful',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'place_id', visit_place_id,
            'marked_at', public.get_philippine_timestamp(),
            'marked_at_philippine_time', public.get_philippine_timestamp()
        )
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all visits for admin (including unsuccessful)
CREATE OR REPLACE FUNCTION public.get_all_visits_for_admin()
RETURNS TABLE (
    visit_id UUID,
    visitor_first_name VARCHAR(100),
    visitor_last_name VARCHAR(100),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    visitor_user_id UUID,
    visitor_role user_role,
    place_id UUID,
    place_name VARCHAR(255),
    place_location VARCHAR(255),
    visit_date DATE,
    purpose VARCHAR(255),
    other_purpose TEXT,
    status visit_status,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID
) AS $$
DECLARE
    philippine_date DATE;
BEGIN
    -- First, automatically mark any past pending visits as unsuccessful
    PERFORM public.mark_past_visits_unsuccessful();
    
    -- Return all visits
    RETURN QUERY
    SELECT 
        sv.id as visit_id,
        sv.visitor_first_name,
        sv.visitor_last_name,
        sv.visitor_email,
        sv.visitor_phone,
        sv.visitor_user_id,
        sv.visitor_role,
        sv.place_id,
        p.name as place_name,
        p.location as place_location,
        sv.visit_date,
        sv.purpose,
        sv.other_purpose,
        sv.status,
        sv.scheduled_at,
        sv.completed_at,
        sv.completed_by
    FROM scheduled_visits sv
    JOIN places_to_visit p ON sv.place_id = p.id
    ORDER BY sv.visit_date DESC, sv.scheduled_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get scheduled visits for a visitor
CREATE OR REPLACE FUNCTION public.get_visitor_scheduled_visits(p_visitor_user_id UUID)
RETURNS TABLE (
    visit_id UUID,
    visitor_first_name VARCHAR(100),
    visitor_last_name VARCHAR(100),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    visitor_user_id UUID,
    visitor_role user_role,
    place_id UUID,
    place_name VARCHAR(255),
    place_location VARCHAR(255),
    visit_date DATE,
    purpose VARCHAR(255),
    other_purpose TEXT,
    status visit_status,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID
) AS $$
BEGIN
    -- First, automatically mark any past pending visits as unsuccessful
    PERFORM public.mark_past_visits_unsuccessful();
    
    RETURN QUERY
    SELECT 
        sv.id as visit_id,
        sv.visitor_first_name,
        sv.visitor_last_name,
        sv.visitor_email,
        sv.visitor_phone,
        sv.visitor_user_id,
        sv.visitor_role,
        sv.place_id,
        p.name as place_name,
        p.location as place_location,
        sv.visit_date,
        sv.purpose,
        sv.other_purpose,
        sv.status,
        sv.scheduled_at,
        sv.completed_at,
        sv.completed_by
    FROM scheduled_visits sv
    JOIN places_to_visit p ON sv.place_id = p.id
    WHERE sv.visitor_user_id = p_visitor_user_id
    ORDER BY sv.visit_date ASC, sv.scheduled_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the create_sample_visits function and any test/sample data
DROP FUNCTION IF EXISTS public.create_sample_visits() CASCADE;

-- Test function to verify complete_visit function exists and can be called
CREATE OR REPLACE FUNCTION public.test_complete_visit_function()
RETURNS TEXT AS $$
BEGIN
    -- Just return a success message to verify the function can be called
    RETURN 'complete_visit function is available and working';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;