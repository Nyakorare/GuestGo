-- Add required visitor gender for scheduling and logs
ALTER TABLE public.scheduled_visits
ADD COLUMN IF NOT EXISTS visitor_gender TEXT;

UPDATE public.scheduled_visits
SET visitor_gender = COALESCE(visitor_gender, 'prefer_not_to_say')
WHERE visitor_gender IS NULL;

ALTER TABLE public.scheduled_visits
ALTER COLUMN visitor_gender SET DEFAULT 'prefer_not_to_say',
ALTER COLUMN visitor_gender SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'scheduled_visits_visitor_gender_check'
  ) THEN
    ALTER TABLE public.scheduled_visits
    ADD CONSTRAINT scheduled_visits_visitor_gender_check
    CHECK (visitor_gender IN ('male', 'female', 'prefer_not_to_say'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.schedule_visit(
    p_visitor_first_name VARCHAR(100),
    p_visitor_last_name VARCHAR(100),
    p_visitor_email VARCHAR(255),
    p_visitor_phone VARCHAR(20),
    p_place_ids UUID[],
    p_visit_date DATE,
    p_purpose VARCHAR(255),
    p_other_purpose TEXT DEFAULT NULL,
    p_visitor_user_id UUID DEFAULT NULL,
    p_visitor_gender TEXT DEFAULT 'prefer_not_to_say'
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
    RAISE NOTICE 'DEBUG: Received visit_date: %, Type: %', p_visit_date, pg_typeof(p_visit_date);

    philippine_date := public.get_philippine_date();
    RAISE NOTICE 'DEBUG: Current Philippine date: %', philippine_date;

    IF p_visitor_gender IS NULL OR p_visitor_gender NOT IN ('male', 'female', 'prefer_not_to_say') THEN
        RAISE EXCEPTION 'Invalid visitor gender. Allowed values: male, female, prefer_not_to_say.';
    END IF;

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

    week_start := p_visit_date - (EXTRACT(DOW FROM p_visit_date)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';

    IF p_visitor_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO visits_this_week
        FROM scheduled_visits
        WHERE visitor_user_id = p_visitor_user_id
          AND visit_date BETWEEN GREATEST(week_start, philippine_date) AND week_end
          AND status IN ('pending', 'completed');
        IF visits_this_week >= 2 THEN
            RAISE EXCEPTION 'Maximum of 2 visits per week allowed per user account. You have already scheduled % visits for the week of %.', visits_this_week, week_start;
        END IF;
    ELSE
        SELECT COUNT(*) INTO visits_this_week
        FROM scheduled_visits
        WHERE visitor_email = p_visitor_email
          AND visit_date BETWEEN GREATEST(week_start, philippine_date) AND week_end
          AND status IN ('pending', 'completed');
        IF visits_this_week >= 2 THEN
            RAISE EXCEPTION 'Maximum of 2 visits per week allowed per email address. You have already scheduled % visits for the week of %.', visits_this_week, week_start;
        END IF;
    END IF;

    FOREACH place_id IN ARRAY p_place_ids
    LOOP
        SELECT public.check_place_visit_limit(place_id, p_visit_date) INTO place_limit_check;

        IF NOT place_limit_check THEN
            SELECT name, current_week_visit_limit, monthly_visit_limit, COALESCE(limit_type, 'weekly')
            INTO place_name, weekly_limit, monthly_limit, limit_type_val
            FROM places_to_visit WHERE id = place_id;

            week_start_limit := p_visit_date - (EXTRACT(DOW FROM p_visit_date)::INTEGER * INTERVAL '1 day');
            week_end_limit := week_start_limit + INTERVAL '6 days';
            month_start_limit := DATE_TRUNC('month', p_visit_date)::DATE;
            month_end_limit := (DATE_TRUNC('month', p_visit_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

            SELECT COUNT(*) INTO visits_this_week_count
            FROM scheduled_visits sv
            JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
            WHERE svp.place_id = place_id
              AND sv.visit_date BETWEEN week_start_limit AND week_end_limit
              AND sv.status IN ('pending', 'completed', 'completed_flagged');

            SELECT COUNT(*) INTO visits_this_month_count
            FROM scheduled_visits sv
            JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
            WHERE svp.place_id = place_id
              AND sv.visit_date BETWEEN month_start_limit AND month_end_limit
              AND sv.status IN ('pending', 'completed', 'completed_flagged');

            PERFORM public.log_action(
                p_visitor_user_id,
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

            RAISE EXCEPTION 'Place "%" has reached its % visit limit for the week/month of %. Please choose a different date or contact the administrator.', place_name, limit_type_val, week_start_limit;
        END IF;
    END LOOP;

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
        visitor_gender,
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
        p_visitor_gender,
        p_visitor_user_id,
        visitor_role,
        p_visit_date,
        p_purpose,
        p_other_purpose
    )
    RETURNING id INTO visit_id;

    FOREACH place_id IN ARRAY p_place_ids
    LOOP
        SELECT name INTO place_name FROM places_to_visit WHERE id = place_id;
        place_names := array_append(place_names, place_name);

        INSERT INTO scheduled_visit_places (visit_id, place_id, status)
        VALUES (visit_id, place_id, 'pending');
    END LOOP;

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

    log_id := public.log_action(
        p_visitor_user_id,
        'visit_scheduled',
        jsonb_build_object(
            'visit_id', visit_id,
            'visitor_name', p_visitor_first_name || ' ' || p_visitor_last_name,
            'visitor_email', p_visitor_email,
            'visitor_gender', p_visitor_gender,
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
                        'visitor_gender', p_visitor_gender,
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
