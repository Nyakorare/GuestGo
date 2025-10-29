-- Add single limit type support: only one of weekly or monthly is enforced per place
-- This migration adds a limit_type column and updates helper functions to honor it.

-- 1) Add column limit_type to places_to_visit
ALTER TABLE places_to_visit
ADD COLUMN IF NOT EXISTS limit_type TEXT CHECK (limit_type IN ('weekly','monthly')) DEFAULT 'weekly';

-- 2) Create or replace function to check place visit limit honoring limit_type
CREATE OR REPLACE FUNCTION public.check_place_visit_limit(
    p_place_id UUID,
    p_visit_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    weekly_limit INTEGER;
    monthly_limit INTEGER;
    limit_type_val TEXT;
    week_start DATE;
    week_end DATE;
    month_start DATE;
    month_end DATE;
    visits_this_week INTEGER;
    visits_this_month INTEGER;
BEGIN
    -- Get current limits and type
    SELECT current_week_visit_limit, monthly_visit_limit, COALESCE(limit_type, 'weekly') INTO weekly_limit, monthly_limit, limit_type_val
    FROM places_to_visit 
    WHERE id = p_place_id;

    -- If both limits not set meaningfully, allow
    IF (weekly_limit IS NULL OR weekly_limit <= 0) AND (monthly_limit IS NULL OR monthly_limit <= 0) THEN
        RETURN TRUE;
    END IF;

    -- Calculate boundaries
    week_start := p_visit_date - (EXTRACT(DOW FROM p_visit_date)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';
    month_start := DATE_TRUNC('month', p_visit_date)::DATE;
    month_end := (DATE_TRUNC('month', p_visit_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    -- Count visits
    SELECT COUNT(*) INTO visits_this_week
    FROM scheduled_visits sv
    JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
    WHERE svp.place_id = p_place_id
      AND sv.visit_date BETWEEN week_start AND week_end
      AND sv.status IN ('pending', 'completed', 'completed_flagged');

    SELECT COUNT(*) INTO visits_this_month
    FROM scheduled_visits sv
    JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
    WHERE svp.place_id = p_place_id
      AND sv.visit_date BETWEEN month_start AND month_end
      AND sv.status IN ('pending', 'completed', 'completed_flagged');

    IF limit_type_val = 'weekly' THEN
        IF weekly_limit IS NULL OR weekly_limit <= 0 THEN
            RETURN TRUE;
        END IF;
        RETURN visits_this_week < weekly_limit;
    ELSE
        IF monthly_limit IS NULL OR monthly_limit <= 0 THEN
            RETURN TRUE;
        END IF;
        RETURN visits_this_month < monthly_limit;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Update get_place_visit_limit_info to include limit_type
DROP FUNCTION IF EXISTS public.get_place_visit_limit_info(UUID);
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
    week_end DATE,
    limit_type TEXT
) AS $$
DECLARE
    current_date_val DATE;
    month_start DATE;
    month_end DATE;
    week_start DATE;
    week_end DATE;
BEGIN
    current_date_val := public.get_philippine_date();
    month_start := DATE_TRUNC('month', current_date_val)::DATE;
    month_end := (DATE_TRUNC('month', current_date_val) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
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
        week_end,
        COALESCE(ptv.limit_type, 'weekly') as limit_type
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

-- 4) New RPC to update place limit settings atomically
CREATE OR REPLACE FUNCTION public.update_place_limit_settings(
    p_place_id UUID,
    p_limit_type TEXT,
    p_weekly_limit INTEGER,
    p_monthly_limit INTEGER,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role user_role;
    current_week INTEGER;
    current_year INTEGER;
    current_month INTEGER;
BEGIN
    SELECT role INTO admin_role FROM user_roles WHERE user_id = p_updated_by;
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update place visit limits';
    END IF;

    IF p_limit_type NOT IN ('weekly','monthly') THEN
        RAISE EXCEPTION 'Invalid limit type: %', p_limit_type;
    END IF;

    -- Basic validations per type
    IF p_limit_type = 'weekly' THEN
        IF p_weekly_limit IS NULL OR p_weekly_limit < 0 THEN
            RAISE EXCEPTION 'Weekly visit limit cannot be negative';
        END IF;
    ELSE
        IF p_monthly_limit IS NULL OR p_monthly_limit < 0 THEN
            RAISE EXCEPTION 'Monthly visit limit cannot be negative';
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

-- 6) Update get_personnel_availability to include limit_type
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
    week_end DATE,
    limit_type TEXT
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
        COALESCE(p.current_week_visit_limit, 50) as weekly_visit_limit,
        COALESCE(p.monthly_visit_limit, 200) as monthly_visit_limit,
        COALESCE(weekly_visits.count, 0)::INTEGER as visits_this_week,
        COALESCE(monthly_visits.count, 0)::INTEGER as visits_this_month,
        week_start,
        week_end,
        COALESCE(p.limit_type, 'weekly') as limit_type
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

-- 7) Backward-compatible wrapper: existing callers use this name
CREATE OR REPLACE FUNCTION public.check_place_weekly_visit_limit(
    p_place_id UUID,
    p_visit_date DATE
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.check_place_visit_limit(p_place_id, p_visit_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


