-- Add unavailable_from date for personnel availability and update RPCs

BEGIN;

-- 1) Add column to store when unavailability starts
ALTER TABLE public.personnel_availability
ADD COLUMN IF NOT EXISTS unavailable_from DATE;

-- 2) Update update_personnel_availability to accept unavailable_from and set it
DROP FUNCTION IF EXISTS public.update_personnel_availability(UUID, UUID, BOOLEAN, TEXT, UUID);
CREATE OR REPLACE FUNCTION public.update_personnel_availability(
    p_personnel_id UUID,
    p_place_id UUID,
    p_is_available BOOLEAN,
    p_unavailability_reason TEXT DEFAULT NULL,
    p_updated_by UUID DEFAULT NULL,
    p_unavailable_from DATE DEFAULT public.get_philippine_date()
)
RETURNS UUID AS $$
DECLARE
    availability_id UUID;
    personnel_role user_role;
BEGIN
    -- Ensure self-update only
    IF p_updated_by != p_personnel_id THEN
        RAISE EXCEPTION 'Personnel can only update their own availability';
    END IF;

    -- Ensure caller has personnel role
    SELECT role INTO personnel_role 
    FROM user_roles 
    WHERE user_id = p_personnel_id;

    IF personnel_role != 'personnel' THEN
        RAISE EXCEPTION 'User must have personnel role to update availability';
    END IF;

    -- Ensure assignment exists
    IF NOT EXISTS (
        SELECT 1 FROM place_personnel 
        WHERE place_id = p_place_id AND personnel_id = p_personnel_id
    ) THEN
        RAISE EXCEPTION 'Personnel is not assigned to this place';
    END IF;

    -- Insert or update availability record
    INSERT INTO personnel_availability (
        personnel_id, place_id, is_available, unavailability_reason, updated_by, unavailable_from
    )
    VALUES (
        p_personnel_id, p_place_id, p_is_available, p_unavailability_reason, p_updated_by,
        CASE WHEN p_is_available THEN NULL ELSE COALESCE(p_unavailable_from, public.get_philippine_date()) END
    )
    ON CONFLICT (personnel_id, place_id)
    DO UPDATE SET 
        is_available = EXCLUDED.is_available,
        unavailability_reason = EXCLUDED.unavailability_reason,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = EXCLUDED.updated_by,
        unavailable_from = EXCLUDED.unavailable_from
    RETURNING id INTO availability_id;

    RETURN availability_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Update get_personnel_availability to compute availability based on unavailable_from date
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
    limit_type TEXT,
    unavailable_from DATE
)
AS $$
DECLARE
    current_date_val DATE;
    current_month INTEGER;
    current_year INTEGER;
    month_start DATE;
    month_end DATE;
    week_start DATE;
    week_end DATE;
BEGIN
    -- Current date/timebox values
    current_date_val := public.get_philippine_date();
    current_month := EXTRACT(MONTH FROM current_date_val);
    current_year := EXTRACT(YEAR FROM current_date_val);

    month_start := DATE_TRUNC('month', current_date_val)::DATE;
    month_end := (DATE_TRUNC('month', current_date_val) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    week_start := current_date_val - (EXTRACT(DOW FROM current_date_val)::INTEGER * INTERVAL '1 day');
    week_end := week_start + INTERVAL '6 days';

    RETURN QUERY
    SELECT 
        p.id as place_id,
        p.name as place_name,
        p.description as place_description,
        p.location as place_location,
        -- Availability becomes false only once unavailable_from is today or earlier
        CASE 
            WHEN COALESCE(pa.is_available, true) = false 
                 AND pa.unavailable_from IS NOT NULL 
                 AND pa.unavailable_from > current_date_val
            THEN true
            ELSE COALESCE(pa.is_available, true)
        END as is_available,
        pa.unavailability_reason,
        pp.assigned_at,
        COALESCE(pa.updated_at, pp.assigned_at) as updated_at,
        COALESCE(p.current_week_visit_limit, 50) as weekly_visit_limit,
        COALESCE(p.monthly_visit_limit, 200) as monthly_visit_limit,
        COALESCE(weekly_visits.count, 0)::INTEGER as visits_this_week,
        COALESCE(monthly_visits.count, 0)::INTEGER as visits_this_month,
        week_start,
        week_end,
        COALESCE(p.limit_type, 'weekly') as limit_type,
        pa.unavailable_from
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

COMMIT;


