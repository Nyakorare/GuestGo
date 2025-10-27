-- Combined migration: Add weekly visit limits for places with monthly reset functionality
-- This migration combines migrations 22, 23, and 25:
-- - Adds visit limit functionality to places
-- - Updates the schedule_visit function to check place visit limits
-- - Updates the get_personnel_availability function to include visit limit information

-- Add visit limit fields to places_to_visit table
ALTER TABLE places_to_visit 
ADD COLUMN IF NOT EXISTS monthly_visit_limit INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS current_week_visit_limit INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS limit_reset_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
ADD COLUMN IF NOT EXISTS limit_reset_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
ADD COLUMN IF NOT EXISTS limit_reset_week INTEGER DEFAULT EXTRACT(WEEK FROM CURRENT_DATE);

-- Create function to reset visit limits for new month
CREATE OR REPLACE FUNCTION public.reset_place_visit_limits_for_new_month()
RETURNS INTEGER AS $$
DECLARE
    current_month INTEGER;
    current_year INTEGER;
    reset_count INTEGER := 0;
BEGIN
    -- Get current month and year
    current_month := EXTRACT(MONTH FROM public.get_philippine_date());
    current_year := EXTRACT(YEAR FROM public.get_philippine_date());
    
    -- Reset limits for places where the month has changed
    UPDATE places_to_visit 
    SET 
        limit_reset_month = current_month,
        limit_reset_year = current_year
    WHERE 
        limit_reset_month != current_month 
        OR limit_reset_year != current_year;
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset weekly visit limits for new week
CREATE OR REPLACE FUNCTION public.reset_place_visit_limits_for_new_week()
RETURNS INTEGER AS $$
DECLARE
    current_week INTEGER;
    current_year INTEGER;
    reset_count INTEGER := 0;
BEGIN
    -- Get current week and year
    current_week := EXTRACT(WEEK FROM public.get_philippine_date());
    current_year := EXTRACT(YEAR FROM public.get_philippine_date());
    
    -- Reset weekly limits for places where the week has changed
    UPDATE places_to_visit 
    SET 
        current_week_visit_limit = LEAST(50, monthly_visit_limit), -- Default weekly limit, but not exceeding monthly
        limit_reset_week = current_week
    WHERE 
        limit_reset_week != current_week;
    
    GET DIAGNOSTICS reset_count = ROW_COUNT;
    
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a place has reached its weekly visit limit
CREATE OR REPLACE FUNCTION public.check_place_weekly_visit_limit(
    p_place_id UUID,
    p_visit_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    weekly_limit INTEGER;
    monthly_limit INTEGER;
    current_week INTEGER;
    current_month INTEGER;
    current_year INTEGER;
    week_start DATE;
    week_end DATE;
    month_start DATE;
    month_end DATE;
    visits_this_week INTEGER;
    visits_this_month INTEGER;
BEGIN
    -- Get current week, month and year
    current_week := EXTRACT(WEEK FROM public.get_philippine_date());
    current_month := EXTRACT(MONTH FROM public.get_philippine_date());
    current_year := EXTRACT(YEAR FROM public.get_philippine_date());
    
    -- Reset limits if it's a new week or month
    PERFORM public.reset_place_visit_limits_for_new_week();
    PERFORM public.reset_place_visit_limits_for_new_month();
    
    -- Get the place's current limits
    SELECT current_week_visit_limit, monthly_visit_limit INTO weekly_limit, monthly_limit
    FROM places_to_visit 
    WHERE id = p_place_id;
    
    -- If no limits are set, allow the visit
    IF weekly_limit IS NULL OR weekly_limit <= 0 OR monthly_limit IS NULL OR monthly_limit <= 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Calculate the week and month boundaries for the visit date
    week_start := p_visit_date - (EXTRACT(DOW FROM p_visit_date)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';
    month_start := DATE_TRUNC('month', p_visit_date)::DATE;
    month_end := (DATE_TRUNC('month', p_visit_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Count visits to this place in the current week
    SELECT COUNT(*) INTO visits_this_week
    FROM scheduled_visits sv
    JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
    WHERE svp.place_id = p_place_id
      AND sv.visit_date BETWEEN week_start AND week_end
      AND sv.status IN ('pending', 'completed', 'completed_flagged');
    
    -- Count visits to this place in the current month
    SELECT COUNT(*) INTO visits_this_month
    FROM scheduled_visits sv
    JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
    WHERE svp.place_id = p_place_id
      AND sv.visit_date BETWEEN month_start AND month_end
      AND sv.status IN ('pending', 'completed', 'completed_flagged');
    
    -- Return true if under both limits, false if at or over either limit
    RETURN visits_this_week < weekly_limit AND visits_this_month < monthly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update place weekly visit limit (admin only)
CREATE OR REPLACE FUNCTION public.update_place_weekly_visit_limit(
    p_place_id UUID,
    p_weekly_limit INTEGER,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    place_name VARCHAR(255);
    current_month_limit INTEGER;
    current_week INTEGER;
    current_year INTEGER;
    log_id UUID;
BEGIN
    -- Check if the user updating is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_updated_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update place visit limits';
    END IF;
    
    -- Get place name and monthly limit for validation
    SELECT name, monthly_visit_limit INTO place_name, current_month_limit 
    FROM places_to_visit WHERE id = p_place_id;
    
    IF place_name IS NULL THEN
        RAISE EXCEPTION 'Place not found';
    END IF;
    
    -- Validate limit
    IF p_weekly_limit < 0 THEN
        RAISE EXCEPTION 'Weekly visit limit cannot be negative';
    END IF;
    
    -- Ensure weekly limit doesn't exceed monthly limit
    IF p_weekly_limit > current_month_limit THEN
        RAISE EXCEPTION 'Weekly visit limit (%) cannot exceed monthly visit limit (%)', p_weekly_limit, current_month_limit;
    END IF;
    
    -- Get current week and year
    current_week := EXTRACT(WEEK FROM public.get_philippine_date());
    current_year := EXTRACT(YEAR FROM public.get_philippine_date());
    
    -- Update the place weekly visit limit
    UPDATE places_to_visit 
    SET 
        current_week_visit_limit = p_weekly_limit,
        limit_reset_week = current_week,
        updated_at = public.get_philippine_timestamp()
    WHERE id = p_place_id;
    
    -- Log the limit update
    log_id := public.log_action(
        p_updated_by,
        'place_weekly_visit_limit_update',
        jsonb_build_object(
            'place_id', p_place_id,
            'place_name', place_name,
            'old_weekly_limit', COALESCE((SELECT current_week_visit_limit FROM places_to_visit WHERE id = p_place_id), 0),
            'new_weekly_limit', p_weekly_limit,
            'monthly_limit', current_month_limit,
            'updated_at', public.get_philippine_timestamp(),
            'reset_week', current_week,
            'reset_year', current_year
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update place monthly visit limit (admin only)
CREATE OR REPLACE FUNCTION public.update_place_monthly_visit_limit(
    p_place_id UUID,
    p_monthly_limit INTEGER,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    place_name VARCHAR(255);
    current_weekly_limit INTEGER;
    current_month INTEGER;
    current_year INTEGER;
    log_id UUID;
BEGIN
    -- Check if the user updating is an admin
    SELECT role INTO admin_role 
    FROM user_roles 
    WHERE user_id = p_updated_by;
    
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update place visit limits';
    END IF;
    
    -- Get place name and current weekly limit for validation
    SELECT name, current_week_visit_limit INTO place_name, current_weekly_limit 
    FROM places_to_visit WHERE id = p_place_id;
    
    IF place_name IS NULL THEN
        RAISE EXCEPTION 'Place not found';
    END IF;
    
    -- Validate limit
    IF p_monthly_limit < 0 THEN
        RAISE EXCEPTION 'Monthly visit limit cannot be negative';
    END IF;
    
    -- Ensure monthly limit is not less than current weekly limit
    IF p_monthly_limit < current_weekly_limit THEN
        RAISE EXCEPTION 'Monthly visit limit (%) cannot be less than current weekly limit (%)', p_monthly_limit, current_weekly_limit;
    END IF;
    
    -- Get current month and year
    current_month := EXTRACT(MONTH FROM public.get_philippine_date());
    current_year := EXTRACT(YEAR FROM public.get_philippine_date());
    
    -- Update the place monthly visit limit
    UPDATE places_to_visit 
    SET 
        monthly_visit_limit = p_monthly_limit,
        limit_reset_month = current_month,
        limit_reset_year = current_year,
        updated_at = public.get_philippine_timestamp()
    WHERE id = p_place_id;
    
    -- Log the limit update
    log_id := public.log_action(
        p_updated_by,
        'place_monthly_visit_limit_update',
        jsonb_build_object(
            'place_id', p_place_id,
            'place_name', place_name,
            'old_monthly_limit', COALESCE((SELECT monthly_visit_limit FROM places_to_visit WHERE id = p_place_id), 0),
            'new_monthly_limit', p_monthly_limit,
            'current_weekly_limit', current_weekly_limit,
            'updated_at', public.get_philippine_timestamp(),
            'reset_month', current_month,
            'reset_year', current_year
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the get_place_visit_limit_info function
DROP FUNCTION IF EXISTS public.get_place_visit_limit_info(UUID);

-- Create function to get place visit limit information
CREATE OR REPLACE FUNCTION public.get_place_visit_limit_info(p_place_id UUID)
RETURNS TABLE (
    place_id UUID,
    place_name VARCHAR(255),
    monthly_visit_limit INTEGER,
    current_week_visit_limit INTEGER,
    limit_reset_month INTEGER,
    limit_reset_year INTEGER,
    limit_reset_week INTEGER,
    visits_this_week INTEGER,
    visits_this_month INTEGER,
    week_start DATE,
    week_end DATE
) AS $$
DECLARE
    current_date_val DATE;
    current_month INTEGER;
    current_year INTEGER;
    month_start DATE;
    month_end DATE;
    week_start DATE;
    week_end DATE;
BEGIN
    -- Get current date and month info
    current_date_val := public.get_philippine_date();
    current_month := EXTRACT(MONTH FROM current_date_val);
    current_year := EXTRACT(YEAR FROM current_date_val);
    
    -- Calculate month boundaries
    month_start := DATE_TRUNC('month', current_date_val)::DATE;
    month_end := (DATE_TRUNC('month', current_date_val) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Calculate week boundaries
    week_start := current_date_val - (EXTRACT(DOW FROM current_date_val)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';
    
    RETURN QUERY
    SELECT 
        ptv.id as place_id,
        ptv.name as place_name,
        ptv.monthly_visit_limit,
        ptv.current_week_visit_limit,
        ptv.limit_reset_month,
        ptv.limit_reset_year,
        ptv.limit_reset_week,
        COALESCE(weekly_visits.count, 0)::INTEGER as visits_this_week,
        COALESCE(monthly_visits.count, 0)::INTEGER as visits_this_month,
        week_start,
        week_end
    FROM places_to_visit ptv
    LEFT JOIN (
        SELECT 
            svp.place_id,
            COUNT(*) as count
        FROM scheduled_visits sv
        JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        WHERE sv.visit_date BETWEEN week_start AND week_end
          AND sv.status IN ('pending', 'completed', 'completed_flagged')
        GROUP BY svp.place_id
    ) weekly_visits ON ptv.id = weekly_visits.place_id
    LEFT JOIN (
        SELECT 
            svp.place_id,
            COUNT(*) as count
        FROM scheduled_visits sv
        JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        WHERE sv.visit_date BETWEEN month_start AND month_end
          AND sv.status IN ('pending', 'completed', 'completed_flagged')
        GROUP BY svp.place_id
    ) monthly_visits ON ptv.id = monthly_visits.place_id
    WHERE ptv.id = p_place_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the new log actions to the enum
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'place_weekly_visit_limit_update';
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'place_monthly_visit_limit_update';

-- Create index for better performance on visit limit checks
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_place_date_status ON scheduled_visits(visit_date, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_visit_places_place_id ON scheduled_visit_places(place_id);

-- Initialize visit limits for existing places
UPDATE places_to_visit 
SET 
    monthly_visit_limit = 200,
    current_week_visit_limit = 50,
    limit_reset_month = EXTRACT(MONTH FROM CURRENT_DATE),
    limit_reset_year = EXTRACT(YEAR FROM CURRENT_DATE),
    limit_reset_week = EXTRACT(WEEK FROM CURRENT_DATE)
WHERE monthly_visit_limit IS NULL;

-- Update schedule_visit function to check place visit limits
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
    place_details JSONB;
    place_limit_check BOOLEAN;
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
    
    -- Check for existing visit on the same day for this user/email
    IF p_visitor_user_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM scheduled_visits
            WHERE visitor_user_id = p_visitor_user_id
              AND visit_date = p_visit_date
              AND status IN ('pending', 'completed')
        ) THEN
            RAISE EXCEPTION 'You already have a scheduled visit on this date.';
        END IF;
    ELSE
        IF EXISTS (
            SELECT 1 FROM scheduled_visits
            WHERE visitor_email = p_visitor_email
              AND visit_date = p_visit_date
              AND status IN ('pending', 'completed')
        ) THEN
            RAISE EXCEPTION 'You already have a scheduled visit on this date.';
        END IF;
    END IF;
    
    -- Check weekly visit limit (now counts visits, not individual place bookings)
    week_start := p_visit_date - (EXTRACT(DOW FROM p_visit_date)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';
    
    -- Check weekly visit limit based on user type
    IF p_visitor_user_id IS NOT NULL THEN
        -- For logged-in users, check by visitor_user_id
        SELECT COUNT(*) INTO visits_this_week
        FROM scheduled_visits
        WHERE visitor_user_id = p_visitor_user_id
          AND visit_date BETWEEN GREATEST(week_start, philippine_date) AND week_end
          AND status IN ('pending', 'completed');
        IF visits_this_week >= 2 THEN
            RAISE EXCEPTION 'Maximum of 2 visits per week allowed per user account. You have already scheduled % visits for the week of %.', visits_this_week, week_start;
        END IF;
    ELSE
        -- For guests, check by visitor_email
        SELECT COUNT(*) INTO visits_this_week
        FROM scheduled_visits
        WHERE visitor_email = p_visitor_email
          AND visit_date BETWEEN GREATEST(week_start, philippine_date) AND week_end
          AND status IN ('pending', 'completed');
        IF visits_this_week >= 2 THEN
            RAISE EXCEPTION 'Maximum of 2 visits per week allowed per email address. You have already scheduled % visits for the week of %.', visits_this_week, week_start;
        END IF;
    END IF;
    
    -- Check place visit limits for each place
    FOREACH place_id IN ARRAY p_place_ids
    LOOP
        -- Check if this place has reached its weekly visit limit
        SELECT public.check_place_weekly_visit_limit(place_id, p_visit_date) INTO place_limit_check;
        
        IF NOT place_limit_check THEN
            -- Get place name for error message
            SELECT name INTO place_name FROM places_to_visit WHERE id = place_id;
            RAISE EXCEPTION 'Place "%" has reached its weekly visit limit for the week of %. Please choose a different date or contact the administrator.', place_name, week_start;
        END IF;
    END LOOP;
    
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
    
    -- Get detailed place information for logging
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'place_id', ptv.id,
                'place_name', ptv.name,
                'place_description', ptv.description,
                'place_location', ptv.location,
                'status', 'pending'
            )
        ) INTO place_details
    FROM places_to_visit ptv
    WHERE ptv.id = ANY(p_place_ids);
    
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
            'places', place_details,
            'history', jsonb_build_array(
                jsonb_build_object(
                    'event', 'scheduled',
                    'timestamp', public.get_philippine_timestamp(),
                    'details', jsonb_build_object(
                        'by', p_visitor_user_id,
                        'purpose', p_purpose,
                        'scheduled_as_guest', visitor_role = 'guest',
                        'places_count', array_length(p_place_ids, 1),
                        'places', place_details
                    )
                )
            )
        )
    );
    
    RETURN visit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the get_personnel_availability function to include visit limit information
DROP FUNCTION IF EXISTS public.get_personnel_availability(UUID);

CREATE OR REPLACE FUNCTION public.get_personnel_availability(p_personnel_id UUID)
RETURNS TABLE (
    place_id UUID,
    place_name VARCHAR(255),
    place_description TEXT,
    place_location VARCHAR(255),
    is_available BOOLEAN,
    unavailability_reason TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    weekly_visit_limit INTEGER,
    monthly_visit_limit INTEGER,
    visits_this_week INTEGER,
    visits_this_month INTEGER,
    week_start DATE,
    week_end DATE
) AS $$
DECLARE
    current_date_val DATE;
    current_month INTEGER;
    current_year INTEGER;
    month_start DATE;
    month_end DATE;
    week_start DATE;
    week_end DATE;
BEGIN
    -- Get current date and month info
    current_date_val := public.get_philippine_date();
    current_month := EXTRACT(MONTH FROM current_date_val);
    current_year := EXTRACT(YEAR FROM current_date_val);
    
    -- Calculate month boundaries
    month_start := DATE_TRUNC('month', current_date_val)::DATE;
    month_end := (DATE_TRUNC('month', current_date_val) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Calculate week boundaries
    week_start := current_date_val - (EXTRACT(DOW FROM current_date_val)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';
    
    RETURN QUERY
    SELECT 
        p.id as place_id,
        p.name as place_name,
        p.description as place_description,
        p.location as place_location,
        COALESCE(pa.is_available, true) as is_available,
        pa.unavailability_reason,
        pp.assigned_at,
        COALESCE(pa.updated_at, pp.assigned_at) as updated_at,
        COALESCE(p.monthly_visit_limit, 200) as monthly_visit_limit,
        COALESCE(p.current_week_visit_limit, 50) as current_week_visit_limit,
        COALESCE(weekly_visits.count, 0)::INTEGER as visits_this_week,
        COALESCE(monthly_visits.count, 0)::INTEGER as visits_this_month,
        week_start,
        week_end
    FROM place_personnel pp
    JOIN places_to_visit p ON pp.place_id = p.id
    LEFT JOIN personnel_availability pa ON pp.place_id = pa.place_id AND pp.personnel_id = pa.personnel_id
    LEFT JOIN (
        SELECT 
            svp.place_id,
            COUNT(*) as count
        FROM scheduled_visits sv
        JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        WHERE sv.visit_date BETWEEN week_start AND week_end
          AND sv.status IN ('pending', 'completed', 'completed_flagged')
        GROUP BY svp.place_id
    ) weekly_visits ON p.id = weekly_visits.place_id
    LEFT JOIN (
        SELECT 
            svp.place_id,
            COUNT(*) as count
        FROM scheduled_visits sv
        JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
        WHERE sv.visit_date BETWEEN month_start AND month_end
          AND sv.status IN ('pending', 'completed', 'completed_flagged')
        GROUP BY svp.place_id
    ) monthly_visits ON p.id = monthly_visits.place_id
    WHERE pp.personnel_id = p_personnel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
