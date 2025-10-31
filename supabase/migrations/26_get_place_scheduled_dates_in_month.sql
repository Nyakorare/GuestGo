-- Function to fetch scheduled dates for a place within a given month

BEGIN;

DROP FUNCTION IF EXISTS public.get_place_scheduled_dates_in_month(UUID, INT, INT);
CREATE OR REPLACE FUNCTION public.get_place_scheduled_dates_in_month(
    p_place_id UUID,
    p_year INT,
    p_month INT
)
RETURNS TABLE (
    visit_date DATE
)
AS $$
DECLARE
    month_start DATE;
    month_end DATE;
BEGIN
    -- Normalize inputs into a month window
    month_start := MAKE_DATE(p_year, p_month, 1);
    month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    RETURN QUERY
    SELECT DISTINCT sv.visit_date::DATE
    FROM scheduled_visits sv
    JOIN scheduled_visit_places svp ON sv.id = svp.visit_id
    WHERE svp.place_id = p_place_id
      AND sv.visit_date BETWEEN month_start AND month_end
      AND sv.status IN ('pending', 'completed', 'completed_flagged');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;


