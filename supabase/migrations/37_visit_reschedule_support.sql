-- Visit reschedule support: allow visitors to request one reschedule per visit
-- and personnel to accept/decline with full user and place limit validation.

BEGIN;

-- 1) Extend scheduled_visits with reschedule metadata (idempotent-safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_visits'
      AND column_name = 'reschedule_requested'
  ) THEN
    ALTER TABLE scheduled_visits
      ADD COLUMN reschedule_requested BOOLEAN DEFAULT FALSE,
      ADD COLUMN reschedule_reason TEXT,
      ADD COLUMN reschedule_status TEXT CHECK (reschedule_status IN ('pending','accepted','declined')),
      ADD COLUMN reschedule_requested_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN reschedule_decided_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN reschedule_decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      ADD COLUMN reschedule_note TEXT,
      ADD COLUMN reschedule_original_date DATE,
      ADD COLUMN reschedule_attempted BOOLEAN DEFAULT FALSE;
  END IF;
END;
$$;

-- 2) Add log_action values for reschedule events (idempotent-safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum e ON e.enumtypid = typ.oid
    WHERE typ.typname = 'log_action'
      AND e.enumlabel = 'visit_reschedule_requested'
  ) THEN
    ALTER TYPE log_action ADD VALUE 'visit_reschedule_requested';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum e ON e.enumtypid = typ.oid
    WHERE typ.typname = 'log_action'
      AND e.enumlabel = 'visit_reschedule_accepted'
  ) THEN
    ALTER TYPE log_action ADD VALUE 'visit_reschedule_accepted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum e ON e.enumtypid = typ.oid
    WHERE typ.typname = 'log_action'
      AND e.enumlabel = 'visit_reschedule_declined'
  ) THEN
    ALTER TYPE log_action ADD VALUE 'visit_reschedule_declined';
  END IF;
END;
$$;

-- Helper: reuse weekly limit calculation for a specific user/email excluding a visit
CREATE OR REPLACE FUNCTION public.check_user_weekly_visit_limit_for_reschedule(
  p_visitor_user_id UUID,
  p_visitor_email VARCHAR,
  p_new_visit_date DATE,
  p_excluded_visit_id UUID
)
RETURNS VOID AS $$
DECLARE
  philippine_date DATE;
  week_start DATE;
  week_end DATE;
  visits_this_week INTEGER;
BEGIN
  philippine_date := public.get_philippine_date();

  week_start := p_new_visit_date - (EXTRACT(DOW FROM p_new_visit_date)::INTEGER * INTERVAL '1 day');
  week_end := week_start + INTERVAL '6 days';

  IF p_visitor_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO visits_this_week
    FROM scheduled_visits
    WHERE visitor_user_id = p_visitor_user_id
      AND id <> p_excluded_visit_id
      AND visit_date BETWEEN GREATEST(week_start, philippine_date) AND week_end
      AND status IN ('pending', 'completed', 'completed_flagged');

    IF visits_this_week >= 2 THEN
      RAISE EXCEPTION 'Maximum of 2 visits per week allowed per user account. You have already scheduled % other visits for the week of %.', visits_this_week, week_start;
    END IF;
  ELSE
    SELECT COUNT(*) INTO visits_this_week
    FROM scheduled_visits
    WHERE visitor_email = p_visitor_email
      AND id <> p_excluded_visit_id
      AND visit_date BETWEEN GREATEST(week_start, philippine_date) AND week_end
      AND status IN ('pending', 'completed', 'completed_flagged');

    IF visits_this_week >= 2 THEN
      RAISE EXCEPTION 'Maximum of 2 visits per week allowed per email address. You have already scheduled % other visits for the week of %.', visits_this_week, week_start;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Visitor: request reschedule (no date chosen yet, just reason + flag)
CREATE OR REPLACE FUNCTION public.request_visit_reschedule(
  p_visit_id UUID,
  p_reason TEXT,
  p_requesting_user_id UUID
)
RETURNS scheduled_visits AS $$
DECLARE
  v_visit scheduled_visits%ROWTYPE;
  v_log_id UUID;
BEGIN
  IF p_visit_id IS NULL THEN
    RAISE EXCEPTION 'Visit ID is required.';
  END IF;

  SELECT * INTO v_visit
  FROM scheduled_visits
  WHERE id = p_visit_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Visit not found.';
  END IF;

  -- Ensure only the owner (visitor) can request
  IF v_visit.visitor_user_id IS NULL OR v_visit.visitor_user_id <> p_requesting_user_id THEN
    RAISE EXCEPTION 'You can only request reschedule for your own visit.';
  END IF;

  -- Only allow reschedule for future visits (not past or today) that are still pending/in progress
  IF v_visit.visit_date <= public.get_philippine_date() THEN
    RAISE EXCEPTION 'You can only request reschedule for future visits.';
  END IF;

  IF v_visit.status NOT IN ('pending','in_progress') THEN
    RAISE EXCEPTION 'You can only request reschedule for pending or in-progress visits.';
  END IF;

  -- Only allow a single reschedule attempt per visit
  IF v_visit.reschedule_attempted OR v_visit.reschedule_status IS NOT NULL OR v_visit.reschedule_requested THEN
    RAISE EXCEPTION 'You have already requested a reschedule for this visit.';
  END IF;

  UPDATE scheduled_visits
  SET
    reschedule_requested = TRUE,
    reschedule_reason = COALESCE(p_reason, 'No reason provided'),
    reschedule_status = 'pending',
    reschedule_requested_at = public.get_philippine_timestamp(),
    reschedule_attempted = TRUE,
    reschedule_original_date = v_visit.visit_date
  WHERE id = p_visit_id
  RETURNING * INTO v_visit;

  -- Log the request
  v_log_id := public.log_action(
    p_requesting_user_id,
    'visit_reschedule_requested',
    jsonb_build_object(
      'visit_id', v_visit.id,
      'original_date', v_visit.reschedule_original_date,
      'reason', v_visit.reschedule_reason
    )
  );

  RETURN v_visit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Personnel: list pending reschedule requests for their assigned places
CREATE OR REPLACE FUNCTION public.get_personnel_reschedule_requests(
  p_personnel_id UUID
)
RETURNS TABLE (
  visit_id UUID,
  visitor_first_name VARCHAR(100),
  visitor_last_name VARCHAR(100),
  visitor_email VARCHAR(255),
  visitor_phone VARCHAR(20),
  visit_date DATE,
  original_visit_date DATE,
  purpose VARCHAR(255),
  other_purpose TEXT,
  reschedule_reason TEXT,
  reschedule_status TEXT,
  reschedule_requested_at TIMESTAMP WITH TIME ZONE,
  places JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.id AS visit_id,
    sv.visitor_first_name,
    sv.visitor_last_name,
    sv.visitor_email,
    sv.visitor_phone,
    sv.visit_date,
    sv.reschedule_original_date,
    sv.purpose,
    sv.other_purpose,
    sv.reschedule_reason,
    sv.reschedule_status,
    sv.reschedule_requested_at,
    COALESCE(
      (SELECT jsonb_agg(
          jsonb_build_object(
            'place_id', svp.place_id,
            'place_name', ptv.name,
            'place_location', ptv.location
          )
        )
        FROM scheduled_visit_places svp
        JOIN places_to_visit ptv ON svp.place_id = ptv.id
        WHERE svp.visit_id = sv.id
      ),
      '[]'::jsonb
    ) AS places
  FROM scheduled_visits sv
  JOIN scheduled_visit_places svp_main ON sv.id = svp_main.visit_id
  JOIN place_personnel pp ON svp_main.place_id = pp.place_id
  WHERE pp.personnel_id = p_personnel_id
    AND sv.reschedule_requested = TRUE
    AND sv.reschedule_status = 'pending'
  GROUP BY sv.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) Personnel: process reschedule (accept/decline) with date + limit checks
CREATE OR REPLACE FUNCTION public.process_visit_reschedule(
  p_visit_id UUID,
  p_personnel_id UUID,
  p_decision TEXT,
  p_new_visit_date DATE DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS scheduled_visits AS $$
DECLARE
  v_visit scheduled_visits%ROWTYPE;
  v_place_id UUID;
  v_limit_ok BOOLEAN;
  v_log_id UUID;
  philippine_date DATE;
  max_schedule_date DATE;
BEGIN
  IF p_visit_id IS NULL THEN
    RAISE EXCEPTION 'Visit ID is required.';
  END IF;

  IF p_decision NOT IN ('accept','decline') THEN
    RAISE EXCEPTION 'Decision must be either accept or decline.';
  END IF;

  SELECT * INTO v_visit
  FROM scheduled_visits
  WHERE id = p_visit_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Visit not found.';
  END IF;

  -- Ensure there is a pending reschedule request
  IF NOT v_visit.reschedule_requested OR v_visit.reschedule_status <> 'pending' THEN
    RAISE EXCEPTION 'No pending reschedule request for this visit.';
  END IF;

  -- Ensure personnel is assigned to at least one place in this visit
  IF NOT EXISTS (
    SELECT 1
    FROM scheduled_visit_places svp
    JOIN place_personnel pp ON svp.place_id = pp.place_id
    WHERE svp.visit_id = p_visit_id
      AND pp.personnel_id = p_personnel_id
  ) THEN
    RAISE EXCEPTION 'You are not assigned to any place for this visit.';
  END IF;

  philippine_date := public.get_philippine_date();
  max_schedule_date := philippine_date + INTERVAL '1 month';

  IF p_decision = 'decline' THEN
    UPDATE scheduled_visits
    SET
      reschedule_status = 'declined',
      reschedule_decided_at = public.get_philippine_timestamp(),
      reschedule_decided_by = p_personnel_id,
      reschedule_note = COALESCE(p_note, 'Reschedule request declined by personnel.')
    WHERE id = p_visit_id
    RETURNING * INTO v_visit;

    v_log_id := public.log_action(
      p_personnel_id,
      'visit_reschedule_declined',
      jsonb_build_object(
        'visit_id', v_visit.id,
        'original_date', v_visit.reschedule_original_date,
        'reason', v_visit.reschedule_reason,
        'note', v_visit.reschedule_note
      )
    );

    RETURN v_visit;
  END IF;

  -- Accept path requires new date and limit checks
  IF p_new_visit_date IS NULL THEN
    RAISE EXCEPTION 'New visit date is required when accepting a reschedule.';
  END IF;

  -- Do not allow choosing the same date as the original schedule or any earlier date
  IF v_visit.reschedule_original_date IS NOT NULL THEN
    IF p_new_visit_date <= v_visit.reschedule_original_date THEN
      RAISE EXCEPTION 'New visit date must be after the original scheduled date (%).', v_visit.reschedule_original_date;
    END IF;
  ELSE
    IF p_new_visit_date <= v_visit.visit_date THEN
      RAISE EXCEPTION 'New visit date must be after the original scheduled date (%).', v_visit.visit_date;
    END IF;
  END IF;

  IF p_new_visit_date < philippine_date THEN
    RAISE EXCEPTION 'Cannot reschedule to a past date. Current Philippine date is %.', philippine_date;
  END IF;

  IF p_new_visit_date > max_schedule_date THEN
    RAISE EXCEPTION 'Cannot reschedule more than 1 month in advance. Maximum allowed date is %.', max_schedule_date;
  END IF;

  -- Check per-user weekly visit limit for the new date (excluding this visit)
  PERFORM public.check_user_weekly_visit_limit_for_reschedule(
    v_visit.visitor_user_id,
    v_visit.visitor_email,
    p_new_visit_date,
    v_visit.id
  );

  -- Check place weekly visit limits for all places in the visit
  FOR v_place_id IN
    SELECT place_id
    FROM scheduled_visit_places
    WHERE visit_id = v_visit.id
  LOOP
    SELECT public.check_place_weekly_visit_limit(v_place_id, p_new_visit_date) INTO v_limit_ok;

    IF NOT v_limit_ok THEN
      RAISE EXCEPTION 'One of the places in this visit has reached its weekly visit limit for the selected week.';
    END IF;
  END LOOP;

  -- All checks passed; update visit date and reschedule metadata
  UPDATE scheduled_visits
  SET
    visit_date = p_new_visit_date,
    reschedule_status = 'accepted',
    reschedule_decided_at = public.get_philippine_timestamp(),
    reschedule_decided_by = p_personnel_id,
    reschedule_note = COALESCE(p_note, 'Reschedule request accepted and date updated.')
  WHERE id = p_visit_id
  RETURNING * INTO v_visit;

  v_log_id := public.log_action(
    p_personnel_id,
    'visit_reschedule_accepted',
    jsonb_build_object(
      'visit_id', v_visit.id,
      'original_date', v_visit.reschedule_original_date,
      'new_date', v_visit.visit_date,
      'reason', v_visit.reschedule_reason,
      'note', v_visit.reschedule_note
    )
  );

  RETURN v_visit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Override get_visitor_scheduled_visits to include reschedule fields
-- Drop old version first so we can safely change the returned columns
DROP FUNCTION IF EXISTS public.get_visitor_scheduled_visits(UUID);

CREATE FUNCTION public.get_visitor_scheduled_visits(p_visitor_user_id UUID)
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
  places JSONB,
  gate_entrance_scanned BOOLEAN,
  gate_entrance_scanned_at TIMESTAMP WITH TIME ZONE,
  gate_entrance_scanned_by UUID,
  gate_exit_scanned BOOLEAN,
  gate_exit_scanned_at TIMESTAMP WITH TIME ZONE,
  gate_exit_scanned_by UUID,
  flagged_for_no_exit BOOLEAN,
  flagged_at TIMESTAMP WITH TIME ZONE,
  flagged_by UUID,
  reschedule_requested BOOLEAN,
  reschedule_reason TEXT,
  reschedule_status TEXT,
  reschedule_requested_at TIMESTAMP WITH TIME ZONE,
  reschedule_decided_at TIMESTAMP WITH TIME ZONE,
  reschedule_decided_by UUID,
  reschedule_note TEXT,
  reschedule_original_date DATE,
  reschedule_attempted BOOLEAN
) AS $$
DECLARE
  gate_fields_exist BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_visits'
      AND column_name = 'gate_entrance_scanned'
  ) INTO gate_fields_exist;

  IF gate_fields_exist THEN
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
        (
          SELECT jsonb_agg(
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
          WHERE svp.visit_id = sv.id
        ),
        '[]'::jsonb
      ) AS places,
      sv.gate_entrance_scanned,
      sv.gate_entrance_scanned_at,
      sv.gate_entrance_scanned_by,
      sv.gate_exit_scanned,
      sv.gate_exit_scanned_at,
      sv.gate_exit_scanned_by,
      sv.flagged_for_no_exit,
      sv.flagged_at,
      sv.flagged_by,
      sv.reschedule_requested,
      sv.reschedule_reason,
      sv.reschedule_status,
      sv.reschedule_requested_at,
      sv.reschedule_decided_at,
      sv.reschedule_decided_by,
      sv.reschedule_note,
      sv.reschedule_original_date,
      sv.reschedule_attempted
    FROM scheduled_visits sv
    WHERE sv.visitor_user_id = p_visitor_user_id
    ORDER BY sv.visit_date DESC, sv.scheduled_at DESC;
  ELSE
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
        (
          SELECT jsonb_agg(
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
          WHERE svp.visit_id = sv.id
        ),
        '[]'::jsonb
      ) AS places,
      FALSE AS gate_entrance_scanned,
      NULL::TIMESTAMP WITH TIME ZONE AS gate_entrance_scanned_at,
      NULL::UUID AS gate_entrance_scanned_by,
      FALSE AS gate_exit_scanned,
      NULL::TIMESTAMP WITH TIME ZONE AS gate_exit_scanned_at,
      NULL::UUID AS gate_exit_scanned_by,
      FALSE AS flagged_for_no_exit,
      NULL::TIMESTAMP WITH TIME ZONE AS flagged_at,
      NULL::UUID AS flagged_by,
      sv.reschedule_requested,
      sv.reschedule_reason,
      sv.reschedule_status,
      sv.reschedule_requested_at,
      sv.reschedule_decided_at,
      sv.reschedule_decided_by,
      sv.reschedule_note,
      sv.reschedule_original_date,
      sv.reschedule_attempted
    FROM scheduled_visits sv
    WHERE sv.visitor_user_id = p_visitor_user_id
    ORDER BY sv.visit_date DESC, sv.scheduled_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


