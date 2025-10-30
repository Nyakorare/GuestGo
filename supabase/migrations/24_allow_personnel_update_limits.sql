-- Allow assigned personnel to update place visit limits in addition to admins
-- Replaces update_place_limit_settings with assignment-aware role check

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

    current_week := EXTRACT(WEEK FROM public.get_philippine_date());
    current_year := EXTRACT(YEAR FROM public.get_philippine_date());
    current_month := EXTRACT(MONTH FROM public.get_philippine_date());

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

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


