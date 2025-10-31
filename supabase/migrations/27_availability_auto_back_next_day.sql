-- Make unavailability apply only on the chosen date and expose raw flag

BEGIN;

-- Replace get_personnel_availability to treat unavailability as single-day
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
    unavailable_from DATE,
    raw_is_available BOOLEAN
)
AS $$
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
        p.id as place_id,
        p.name as place_name,
        p.description as place_description,
        p.location as place_location,
        -- Unavailable only on the selected date; otherwise available
        CASE 
          WHEN pa.unavailable_from IS NOT NULL AND pa.unavailable_from = current_date_val THEN false
          ELSE true
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
        pa.unavailable_from,
        pa.is_available as raw_is_available
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


