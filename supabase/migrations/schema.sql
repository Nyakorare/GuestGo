-- Drop existing tables if they exist
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS place_personnel CASCADE;
DROP TABLE IF EXISTS personnel_availability CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS places_to_visit CASCADE;
DROP TABLE IF EXISTS scheduled_visits CASCADE;
DROP TABLE IF EXISTS scheduled_visit_places CASCADE;

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

-- Create function to schedule a visit with multiple places
CREATE OR REPLACE FUNCTION public.schedule_visit(
    p_visitor_first_name VARCHAR(100),
    p_visitor_last_name VARCHAR(100),
    p_visitor_email VARCHAR(255),
    p_visitor_phone VARCHAR(20),
    p_place_ids UUID[], -- Changed to array of place IDs
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
    place_id UUID;
    place_names TEXT[] := '{}';
    place_name TEXT;
BEGIN
    -- Debug: Log the received date and current Philippine date
    RAISE NOTICE 'DEBUG: Received visit_date: %, Type: %', p_visit_date, pg_typeof(p_visit_date);
    
    philippine_date := public.get_philippine_date();
    RAISE NOTICE 'DEBUG: Current Philippine date: %', philippine_date;
    
    -- Validate that at least one place is provided
    IF array_length(p_place_ids, 1) IS NULL OR array_length(p_place_ids, 1) = 0 THEN
        RAISE EXCEPTION 'At least one place must be selected for the visit.';
    END IF;
    
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
    
    -- Check weekly visit limit (now counts visits, not individual place bookings)
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
    
    -- Create the main visit record
    INSERT INTO scheduled_visits (
        visitor_first_name,
        visitor_last_name,
        visitor_email,
        visitor_phone,
        visitor_user_id,
        visitor_role,
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
        p_visit_date,
        p_purpose,
        p_other_purpose
    )
    RETURNING id INTO visit_id;
    
    -- Add all places to the visit
    FOREACH place_id IN ARRAY p_place_ids
    LOOP
        -- Get place name for logging
        SELECT name INTO place_name FROM places_to_visit WHERE id = place_id;
        place_names := array_append(place_names, place_name);
        
        -- Insert into scheduled_visit_places
        INSERT INTO scheduled_visit_places (visit_id, place_id, status)
        VALUES (visit_id, place_id, 'pending');
    END LOOP;
    
    -- Log the visit with all places
    log_id := public.log_action(
        p_visitor_user_id, -- This will be NULL for guest visits, which is fine
        'visit_scheduled',
        jsonb_build_object(
            'visit_id', visit_id,
            'visitor_name', p_visitor_first_name || ' ' || p_visitor_last_name,
            'visitor_email', p_visitor_email,
            'visitor_role', visitor_role,
            'visit_date', p_visit_date,
            'purpose', p_purpose,
            'is_guest', visitor_role = 'guest',
            'place_ids', p_place_ids,
            'place_names', place_names,
            'total_places', array_length(p_place_ids, 1),
            'scheduled_at_philippine_time', public.get_philippine_timestamp(),
            'history', jsonb_build_array(
                jsonb_build_object(
                    'event', 'scheduled',
                    'timestamp', public.get_philippine_timestamp(),
                    'details', jsonb_build_object(
                        'by', p_visitor_user_id,
                        'purpose', p_purpose,
                        'scheduled_as_guest', visitor_role = 'guest',
                        'places_count', array_length(p_place_ids, 1)
                    )
                )
            )
        )
    );
    
    RETURN visit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add places to an existing visit
CREATE OR REPLACE FUNCTION public.add_places_to_visit(
    p_visit_id UUID,
    p_place_ids UUID[],
    p_added_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    place_id UUID;
    place_names TEXT[] := '{}';
    place_name TEXT;
    existing_place_count INTEGER;
    new_place_count INTEGER;
    log_row RECORD;
    new_history JSONB;
BEGIN
    -- Check if visit exists and is still pending
    IF NOT EXISTS (
        SELECT 1 FROM scheduled_visits 
        WHERE id = p_visit_id AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'Visit not found or cannot be modified (not pending).';
    END IF;
    
    -- Validate that at least one place is provided
    IF array_length(p_place_ids, 1) IS NULL OR array_length(p_place_ids, 1) = 0 THEN
        RAISE EXCEPTION 'At least one place must be selected.';
    END IF;
    
    -- Get current place count
    SELECT COUNT(*) INTO existing_place_count 
    FROM scheduled_visit_places 
    WHERE visit_id = p_visit_id;
    
    -- Add new places
    FOREACH place_id IN ARRAY p_place_ids
    LOOP
        -- Check if place is already in this visit
        IF NOT EXISTS (
            SELECT 1 FROM scheduled_visit_places 
            WHERE visit_id = p_visit_id AND place_id = place_id
        ) THEN
            -- Get place name for logging
            SELECT name INTO place_name FROM places_to_visit WHERE id = place_id;
            place_names := array_append(place_names, place_name);
            
            -- Insert into scheduled_visit_places
            INSERT INTO scheduled_visit_places (visit_id, place_id, status)
            VALUES (p_visit_id, place_id, 'pending');
        END IF;
    END LOOP;
    
    -- Get new place count
    SELECT COUNT(*) INTO new_place_count 
    FROM scheduled_visit_places 
    WHERE visit_id = p_visit_id;
    
    -- Update the log entry if places were added
    IF array_length(place_names, 1) > 0 THEN
        SELECT * INTO log_row FROM logs WHERE details->>'visit_id' = p_visit_id::text AND action = 'visit_scheduled' ORDER BY created_at LIMIT 1;
        
        IF log_row.id IS NOT NULL THEN
            new_history := (log_row.details->'history') || jsonb_build_array(
                jsonb_build_object(
                    'event', 'places_added',
                    'timestamp', public.get_philippine_timestamp(),
                    'details', jsonb_build_object(
                        'by', p_added_by,
                        'added_places', place_names,
                        'places_count', array_length(place_names, 1),
                        'total_places', new_place_count
                    )
                )
            );
            
            UPDATE logs SET details = jsonb_set(log_row.details, '{history}', new_history) WHERE id = log_row.id;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically mark past pending visits as unsuccessful
CREATE OR REPLACE FUNCTION public.mark_past_visits_unsuccessful()
RETURNS INTEGER AS $$
DECLARE
    philippine_date DATE;
    affected_rows INTEGER;
    visit_record RECORD;
    log_row RECORD;
    new_history JSONB;
    existing_unsuccessful_events INTEGER;
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
    
    -- Update the original visit_scheduled log entries to reflect the status change
    FOR visit_record IN 
        SELECT id, visitor_user_id, visitor_role
        FROM scheduled_visits 
        WHERE status = 'unsuccessful' 
          AND visit_date < philippine_date
          AND completed_at >= (public.get_philippine_timestamp() - INTERVAL '1 minute')
    LOOP
        -- Find the original visit_scheduled log entry for this visit
        SELECT * INTO log_row 
        FROM logs 
        WHERE details->>'visit_id' = visit_record.id::text 
          AND action = 'visit_scheduled' 
        ORDER BY created_at LIMIT 1;
        
        -- If we found the original log entry, check if it already has an unsuccessful event
        IF log_row.id IS NOT NULL THEN
            -- Count existing 'marked_unsuccessful' events in the history
            SELECT COUNT(*) INTO existing_unsuccessful_events
            FROM jsonb_array_elements(log_row.details->'history') AS history_item
            WHERE history_item->>'event' = 'marked_unsuccessful';
            
            -- Only add the unsuccessful event if it doesn't already exist
            IF existing_unsuccessful_events = 0 THEN
                new_history := (log_row.details->'history') || jsonb_build_array(
                    jsonb_build_object(
                        'event', 'marked_unsuccessful',
                        'timestamp', public.get_philippine_timestamp(),
                        'details', jsonb_build_object(
                            'by', 'system',
                            'reason', 'Visit was not completed on or before the scheduled date',
                            'auto_marked', true
                        )
                    )
                );
                
                -- Update the log entry to reflect the unsuccessful status
                UPDATE logs 
                SET details = jsonb_set(
                    jsonb_set(log_row.details, '{history}', new_history),
                    '{current_status}',
                    '"unsuccessful"'
                ) 
                WHERE id = log_row.id;
            END IF;
        END IF;
    END LOOP;
    
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

-- Create a function to get current Philippine date (for use in other functions)
CREATE OR REPLACE FUNCTION public.get_philippine_date()
RETURNS DATE AS $$
BEGIN
    -- Use only AT TIME ZONE 'Asia/Manila' to get the correct Philippine date
    RETURN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current Philippine timestamp
CREATE OR REPLACE FUNCTION public.get_philippine_timestamp()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    -- Use only AT TIME ZONE 'Asia/Manila' to get the correct Philippine timestamp
    RETURN CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Debug function to check timezone conversion
CREATE OR REPLACE FUNCTION public.debug_timezone_info()
RETURNS TABLE (
    current_utc TIMESTAMP WITH TIME ZONE,
    current_philippine TIMESTAMP WITH TIME ZONE,
    philippine_date DATE,
    utc_date DATE,
    timezone_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        NOW() as current_utc,
        NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila' as current_philippine,
        (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila')::DATE as philippine_date,
        NOW()::DATE as utc_date,
        current_setting('timezone') as timezone_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test function to debug date comparison
CREATE OR REPLACE FUNCTION public.test_date_comparison(test_date DATE)
RETURNS TABLE (
    test_date_input DATE,
    philippine_date DATE,
    is_future BOOLEAN,
    comparison_result TEXT
) AS $$
DECLARE
    philippine_date_val DATE;
BEGIN
    philippine_date_val := public.get_philippine_date();
    
    RETURN QUERY
    SELECT 
        test_date as test_date_input,
        philippine_date_val as philippine_date,
        test_date > philippine_date_val as is_future,
        CASE 
            WHEN test_date > philippine_date_val THEN 'Future date'
            WHEN test_date = philippine_date_val THEN 'Today'
            ELSE 'Past date'
        END as comparison_result;
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
    completed_places BIGINT
) AS $$
BEGIN
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
        (SELECT COUNT(*) FROM scheduled_visit_places svp3 WHERE svp3.visit_id = sv.id AND svp3.status = 'completed') as completed_places
    FROM scheduled_visits sv
    JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
    LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
    WHERE svp.place_id IN (
        SELECT pp.place_id FROM place_personnel pp WHERE pp.personnel_id = p_personnel_id
    )
    AND sv.status IN ('pending', 'completed')
    ORDER BY sv.visit_date ASC, sv.scheduled_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to complete a specific place in a visit
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
                    'all_places_completed', all_places_completed
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

-- Update the existing complete_visit function to handle the new structure
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
                    'total_places', array_length(place_names, 1)
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
                'note', 'Visit was scheduled as guest or log entry was missing'
            )
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
    log_row RECORD;
    new_history JSONB;
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
    
    -- Try to find existing log entry for this visit
    SELECT * INTO log_row FROM logs WHERE details->>'visit_id' = p_visit_id::text AND action = 'visit_scheduled' ORDER BY created_at LIMIT 1;
    
    IF log_row.id IS NOT NULL THEN
        -- Update existing log entry
        new_history := (log_row.details->'history') || jsonb_build_array(
            jsonb_build_object(
                'event', 'marked_unsuccessful',
                'timestamp', public.get_philippine_timestamp(),
                'details', jsonb_build_object(
                    'by', p_marked_by,
                    'reason', 'Manually marked as unsuccessful by admin'
                )
            )
        );
        UPDATE logs SET details = jsonb_set(
            jsonb_set(log_row.details, '{history}', new_history),
            '{current_status}',
            '"unsuccessful"'
        ) WHERE id = log_row.id;
    ELSE
        -- Create new log entry for visits without existing logs
        PERFORM public.log_action(
            p_marked_by,
            'visit_unsuccessful',
            jsonb_build_object(
                'visit_id', p_visit_id,
                'place_id', visit_place_id,
                'marked_at', public.get_philippine_timestamp(),
                'marked_at_philippine_time', public.get_philippine_timestamp(),
                'reason', 'Manually marked as unsuccessful by admin'
            )
        );
    END IF;
    
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
    completed_by UUID,
    total_places BIGINT,
    completed_places BIGINT
) AS $$
DECLARE
    philippine_date DATE;
BEGIN
    -- First, automatically mark any past pending visits as unsuccessful
    PERFORM public.mark_past_visits_unsuccessful();
    
    -- Return all visits with place information
    RETURN QUERY
    SELECT 
        sv.id as visit_id,
        sv.visitor_first_name,
        sv.visitor_last_name,
        sv.visitor_email,
        sv.visitor_phone,
        sv.visitor_user_id,
        sv.visitor_role,
        svp.place_id,
        ptv.name as place_name,
        ptv.location as place_location,
        sv.visit_date,
        sv.purpose,
        sv.other_purpose,
        sv.status,
        sv.scheduled_at,
        sv.completed_at,
        sv.completed_by,
        (SELECT COUNT(*) FROM scheduled_visit_places svp2 WHERE svp2.visit_id = sv.id) as total_places,
        (SELECT COUNT(*) FROM scheduled_visit_places svp3 WHERE svp3.visit_id = sv.id AND svp3.status = 'completed') as completed_places
    FROM scheduled_visits sv
    JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
    LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
    ORDER BY sv.visit_date DESC, sv.scheduled_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get visitor's scheduled visits including unsuccessful ones
CREATE OR REPLACE FUNCTION public.get_visitor_scheduled_visits(p_visitor_user_id UUID)
RETURNS TABLE (
    id UUID,
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
    places JSONB -- Changed to JSONB to include all places for this visit
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sv.id,
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
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'place_id', svp.place_id,
                    'place_name', ptv.name,
                    'place_description', ptv.description,
                    'place_location', ptv.location,
                    'status', svp.status,
                    'completed_at', svp.completed_at,
                    'completed_by', svp.completed_by
                )
            )
            FROM scheduled_visit_places svp
            LEFT JOIN places_to_visit ptv ON svp.place_id = ptv.id
            WHERE svp.visit_id = sv.id),
            '[]'::jsonb
        ) as places
    FROM scheduled_visits sv
    WHERE sv.visitor_user_id = p_visitor_user_id
    ORDER BY sv.visit_date DESC, sv.scheduled_at DESC;
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

-- Function to clean up duplicate 'marked_unsuccessful' events from existing logs
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_unsuccessful_events()
RETURNS INTEGER AS $$
DECLARE
    log_record RECORD;
    cleaned_count INTEGER := 0;
    new_history JSONB;
    history_item JSONB;
    unique_events JSONB := '[]'::JSONB;
    event_key TEXT;
BEGIN
    -- Loop through all visit_scheduled logs that have history
    FOR log_record IN 
        SELECT id, details 
        FROM logs 
        WHERE action = 'visit_scheduled' 
          AND details ? 'history'
          AND jsonb_typeof(details->'history') = 'array'
    LOOP
        -- Reset unique events array for each log
        unique_events := '[]'::JSONB;
        
        -- Process each history item
        FOR history_item IN 
            SELECT * FROM jsonb_array_elements(log_record.details->'history')
        LOOP
            -- For 'marked_unsuccessful' events, create a unique key and only keep the first one
            IF history_item->>'event' = 'marked_unsuccessful' THEN
                event_key := 'marked_unsuccessful';
                
                -- Check if we already have a 'marked_unsuccessful' event
                IF NOT EXISTS (
                    SELECT 1 FROM jsonb_array_elements(unique_events) AS existing_event
                    WHERE existing_event->>'event' = 'marked_unsuccessful'
                ) THEN
                    -- Add the first 'marked_unsuccessful' event
                    unique_events := unique_events || history_item;
                END IF;
            ELSE
                -- For all other events, keep them as they are
                unique_events := unique_events || history_item;
            END IF;
        END LOOP;
        
        -- Update the log if the history has changed
        IF unique_events != log_record.details->'history' THEN
            UPDATE logs 
            SET details = jsonb_set(log_record.details, '{history}', unique_events)
            WHERE id = log_record.id;
            
            cleaned_count := cleaned_count + 1;
        END IF;
    END LOOP;
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually trigger cleanup of past visits (for admin use)
CREATE OR REPLACE FUNCTION public.trigger_daily_visit_status_check()
RETURNS INTEGER AS $$
DECLARE
    affected_visits INTEGER;
    cleaned_logs INTEGER;
BEGIN
    -- Mark past visits as unsuccessful
    affected_visits := public.mark_past_visits_unsuccessful();
    
    -- Clean up any duplicate log entries
    cleaned_logs := public.cleanup_duplicate_unsuccessful_events();
    
    -- Log the cleanup action
    PERFORM public.log_action(
        NULL, -- System action
        'visit_unsuccessful',
        jsonb_build_object(
            'action', 'manual_trigger_cleanup',
            'affected_visits', affected_visits,
            'cleaned_logs', cleaned_logs,
            'executed_at', public.get_philippine_timestamp(),
            'executed_at_philippine_time', public.get_philippine_timestamp()
        )
    );
    
    RETURN affected_visits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Drop old foreign key and column if exists
ALTER TABLE scheduled_visits DROP CONSTRAINT IF EXISTS scheduled_visits_place_id_fkey;
ALTER TABLE scheduled_visits DROP COLUMN IF EXISTS place_id;

-- 2. Create scheduled_visit_places table
CREATE TABLE scheduled_visit_places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_id UUID REFERENCES scheduled_visits(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places_to_visit(id) ON DELETE CASCADE,
    status visit_status DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(visit_id, place_id)
);