-- Add history logging for limit changes and enforcement
-- This migration adds logging when limits are changed or enforced (blocking visits)

-- 1) Update update_place_limit_settings to add history logging when limits are changed
CREATE OR REPLACE FUNCTION public.update_place_limit_settings(
    p_place_id UUID,
    p_limit_type TEXT,
    p_weekly_limit INTEGER,
    p_monthly_limit INTEGER,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
    is_assigned BOOLEAN;
    current_week INTEGER;
    current_year INTEGER;
    current_month INTEGER;
    place_name_val VARCHAR(255);
    old_weekly_limit INTEGER;
    old_monthly_limit INTEGER;
    old_limit_type TEXT;
    log_id UUID;
BEGIN
    SELECT role INTO user_role_val FROM user_roles WHERE user_id = p_updated_by;

    IF user_role_val IS NULL THEN
        RAISE EXCEPTION 'User has no role assigned';
    END IF;

    -- Permit admins, or personnel assigned to the place
    IF user_role_val != 'admin' THEN
        IF user_role_val = 'personnel' THEN
            SELECT EXISTS (
                SELECT 1 FROM place_personnel
                WHERE place_id = p_place_id AND personnel_id = p_updated_by
            ) INTO is_assigned;
            IF NOT is_assigned THEN
                RAISE EXCEPTION 'Only admins or assigned personnel can update place visit limits';
            END IF;
        ELSE
            RAISE EXCEPTION 'Only admins or assigned personnel can update place visit limits';
        END IF;
    END IF;

    IF p_limit_type NOT IN ('weekly','monthly') THEN
        RAISE EXCEPTION 'Invalid limit type: %', p_limit_type;
    END IF;

    -- Basic validations per type
    IF p_limit_type = 'weekly' THEN
        IF p_weekly_limit IS NULL OR p_weekly_limit <= 0 THEN
            RAISE EXCEPTION 'Weekly visit limit must be at least 1';
        END IF;
    ELSE
        IF p_monthly_limit IS NULL OR p_monthly_limit <= 0 THEN
            RAISE EXCEPTION 'Monthly visit limit must be at least 1';
        END IF;
    END IF;

    -- Get current values before update for logging
    SELECT name, current_week_visit_limit, monthly_visit_limit, COALESCE(limit_type, 'weekly')
    INTO place_name_val, old_weekly_limit, old_monthly_limit, old_limit_type
    FROM places_to_visit
    WHERE id = p_place_id;

    IF place_name_val IS NULL THEN
        RAISE EXCEPTION 'Place not found';
    END IF;

    current_week := EXTRACT(WEEK FROM public.get_philippine_date());
    current_year := EXTRACT(YEAR FROM public.get_philippine_date());
    current_month := EXTRACT(MONTH FROM public.get_philippine_date());

    -- Update the place limits
    UPDATE places_to_visit
    SET 
        limit_type = p_limit_type,
        current_week_visit_limit = COALESCE(p_weekly_limit, current_week_visit_limit),
        monthly_visit_limit = COALESCE(p_monthly_limit, monthly_visit_limit),
        limit_reset_week = CASE WHEN p_limit_type = 'weekly' THEN current_week ELSE limit_reset_week END,
        limit_reset_month = CASE WHEN p_limit_type = 'monthly' THEN current_month ELSE limit_reset_month END,
        limit_reset_year = CASE WHEN p_limit_type = 'monthly' THEN current_year ELSE limit_reset_year END,
        updated_at = public.get_philippine_timestamp()
    WHERE id = p_place_id;

    -- Log the limit change
    -- Determine which action to use based on what changed
    -- Check if limit type changed
    IF old_limit_type != p_limit_type THEN
        -- Limit type changed - log based on new type
        IF p_limit_type = 'weekly' THEN
            log_id := public.log_action(
                p_updated_by,
                'place_weekly_visit_limit_update',
                jsonb_build_object(
                    'place_id', p_place_id,
                    'place_name', place_name_val,
                    'old_weekly_limit', COALESCE(old_weekly_limit, 0),
                    'new_weekly_limit', COALESCE(p_weekly_limit, old_weekly_limit),
                    'old_limit_type', old_limit_type,
                    'new_limit_type', p_limit_type,
                    'monthly_limit', COALESCE(p_monthly_limit, old_monthly_limit),
                    'updated_at', public.get_philippine_timestamp(),
                    'reset_week', current_week,
                    'reset_year', current_year,
                    'note', 'Limit type changed'
                )
            );
        ELSE
            log_id := public.log_action(
                p_updated_by,
                'place_monthly_visit_limit_update',
                jsonb_build_object(
                    'place_id', p_place_id,
                    'place_name', place_name_val,
                    'old_monthly_limit', COALESCE(old_monthly_limit, 0),
                    'new_monthly_limit', COALESCE(p_monthly_limit, old_monthly_limit),
                    'old_limit_type', old_limit_type,
                    'new_limit_type', p_limit_type,
                    'current_weekly_limit', COALESCE(p_weekly_limit, old_weekly_limit),
                    'updated_at', public.get_philippine_timestamp(),
                    'reset_month', current_month,
                    'reset_year', current_year,
                    'note', 'Limit type changed'
                )
            );
        END IF;
    ELSIF p_limit_type = 'weekly' AND old_weekly_limit IS DISTINCT FROM p_weekly_limit THEN
        -- Weekly limit value changed (same type)
        log_id := public.log_action(
            p_updated_by,
            'place_weekly_visit_limit_update',
            jsonb_build_object(
                'place_id', p_place_id,
                'place_name', place_name_val,
                'old_weekly_limit', COALESCE(old_weekly_limit, 0),
                'new_weekly_limit', p_weekly_limit,
                'old_limit_type', old_limit_type,
                'new_limit_type', p_limit_type,
                'monthly_limit', COALESCE(p_monthly_limit, old_monthly_limit),
                'updated_at', public.get_philippine_timestamp(),
                'reset_week', current_week,
                'reset_year', current_year
            )
        );
    ELSIF p_limit_type = 'monthly' AND old_monthly_limit IS DISTINCT FROM p_monthly_limit THEN
        -- Monthly limit value changed (same type)
        log_id := public.log_action(
            p_updated_by,
            'place_monthly_visit_limit_update',
            jsonb_build_object(
                'place_id', p_place_id,
                'place_name', place_name_val,
                'old_monthly_limit', COALESCE(old_monthly_limit, 0),
                'new_monthly_limit', p_monthly_limit,
                'old_limit_type', old_limit_type,
                'new_limit_type', p_limit_type,
                'current_weekly_limit', COALESCE(p_weekly_limit, old_weekly_limit),
                'updated_at', public.get_philippine_timestamp(),
                'reset_month', current_month,
                'reset_year', current_year
            )
        );
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) Update schedule_visit to log when a visit is blocked due to limit enforcement
CREATE OR REPLACE FUNCTION public.schedule_visit(
    p_visitor_first_name VARCHAR(100),
    p_visitor_last_name VARCHAR(100),
    p_visitor_email VARCHAR(255),
    p_visitor_phone VARCHAR(20),
    p_place_ids UUID[],
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
    limit_type_val TEXT;
    weekly_limit INTEGER;
    monthly_limit INTEGER;
    visits_this_week_count INTEGER;
    visits_this_month_count INTEGER;
    week_start_limit DATE;
    week_end_limit DATE;
    month_start_limit DATE;
    month_end_limit DATE;
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
        -- Check if this place has reached its visit limit
        SELECT public.check_place_visit_limit(place_id, p_visit_date) INTO place_limit_check;
        
        IF NOT place_limit_check THEN
            -- Get place details for logging
            SELECT name, current_week_visit_limit, monthly_visit_limit, COALESCE(limit_type, 'weekly')
            INTO place_name, weekly_limit, monthly_limit, limit_type_val
            FROM places_to_visit WHERE id = place_id;
            
            -- Calculate boundaries for visit counting
            week_start_limit := p_visit_date - (EXTRACT(DOW FROM p_visit_date)::INTEGER * INTERVAL '1 day');
            week_end_limit := week_start_limit + INTERVAL '6 days';
            month_start_limit := DATE_TRUNC('month', p_visit_date)::DATE;
            month_end_limit := (DATE_TRUNC('month', p_visit_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
            
            -- Count visits to this place in the current week
            SELECT COUNT(*) INTO visits_this_week_count
            FROM scheduled_visits sv
            JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
            WHERE svp.place_id = place_id
              AND sv.visit_date BETWEEN week_start_limit AND week_end_limit
              AND sv.status IN ('pending', 'completed', 'completed_flagged');
            
            -- Count visits to this place in the current month
            SELECT COUNT(*) INTO visits_this_month_count
            FROM scheduled_visits sv
            JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
            WHERE svp.place_id = place_id
              AND sv.visit_date BETWEEN month_start_limit AND month_end_limit
              AND sv.status IN ('pending', 'completed', 'completed_flagged');
            
            -- Log the limit enforcement (visit blocked)
            PERFORM public.log_action(
                p_visitor_user_id, -- This will be NULL for guest visits, which is fine
                'visit_limit_enforced',
                jsonb_build_object(
                    'place_id', place_id,
                    'place_name', place_name,
                    'visitor_name', p_visitor_first_name || ' ' || p_visitor_last_name,
                    'visitor_email', p_visitor_email,
                    'visit_date', p_visit_date,
                    'limit_type', limit_type_val,
                    'weekly_limit', COALESCE(weekly_limit, 0),
                    'monthly_limit', COALESCE(monthly_limit, 0),
                    'visits_this_week', visits_this_week_count,
                    'visits_this_month', visits_this_month_count,
                    'enforced_at', public.get_philippine_timestamp(),
                    'reason', CASE 
                        WHEN limit_type_val = 'weekly' AND visits_this_week_count >= COALESCE(weekly_limit, 0) THEN 'Weekly limit reached'
                        WHEN limit_type_val = 'monthly' AND visits_this_month_count >= COALESCE(monthly_limit, 0) THEN 'Monthly limit reached'
                        ELSE 'Limit exceeded'
                    END
                )
            );
            
            -- Raise exception after logging
            RAISE EXCEPTION 'Place "%" has reached its % visit limit for the week/month of %. Please choose a different date or contact the administrator.', place_name, limit_type_val, week_start_limit;
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

-- 3) Add the new log action type for limit enforcement
ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'visit_limit_enforced';

