-- Add explicit guard-to-gate assignments with logging-aware RPCs

CREATE TABLE IF NOT EXISTS public.guard_gate_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_id UUID NOT NULL REFERENCES public.gates(id) ON DELETE CASCADE,
    guard_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT public.get_philippine_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT public.get_philippine_timestamp(),
    UNIQUE (gate_id),
    UNIQUE (guard_user_id)
);

CREATE INDEX IF NOT EXISTS idx_guard_gate_assignments_gate_id
    ON public.guard_gate_assignments(gate_id);

CREATE INDEX IF NOT EXISTS idx_guard_gate_assignments_guard_user_id
    ON public.guard_gate_assignments(guard_user_id);

CREATE OR REPLACE FUNCTION public.assign_guard_to_gate(
    p_gate_id UUID,
    p_guard_user_id UUID,
    p_assigned_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role user_role;
    guard_role user_role;
    gate_name TEXT;
    old_guard_id UUID;
    old_guard_name TEXT;
    new_guard_name TEXT;
    existing_gate_id UUID;
BEGIN
    SELECT role INTO requester_role
    FROM public.user_roles
    WHERE user_id = p_assigned_by;

    IF requester_role IS NULL THEN
        RAISE EXCEPTION 'Requester role not found';
    END IF;

    IF requester_role NOT IN ('admin', 'guard') THEN
        RAISE EXCEPTION 'Only admin or guard can edit gate assignment';
    END IF;

    IF requester_role = 'guard'
       AND p_guard_user_id IS NOT NULL
       AND p_guard_user_id IS DISTINCT FROM p_assigned_by THEN
        RAISE EXCEPTION 'Guards can only update their own assignment';
    END IF;

    SELECT name INTO gate_name
    FROM public.gates
    WHERE id = p_gate_id;

    IF gate_name IS NULL THEN
        RAISE EXCEPTION 'Gate not found';
    END IF;

    IF p_guard_user_id IS NOT NULL THEN
        SELECT role INTO guard_role
        FROM public.user_roles
        WHERE user_id = p_guard_user_id;

        IF guard_role IS DISTINCT FROM 'guard' THEN
            RAISE EXCEPTION 'Selected user is not a guard';
        END IF;

        SELECT gate_id INTO existing_gate_id
        FROM public.guard_gate_assignments
        WHERE guard_user_id = p_guard_user_id
          AND gate_id <> p_gate_id
        LIMIT 1;

        IF existing_gate_id IS NOT NULL THEN
            RAISE EXCEPTION 'This guard is already assigned to another gate';
        END IF;
    END IF;

    SELECT gga.guard_user_id,
           COALESCE(NULLIF(TRIM(CONCAT(ur.first_name, ' ', ur.last_name)), ''), ur.email, 'Unknown Guard')
    INTO old_guard_id, old_guard_name
    FROM public.guard_gate_assignments gga
    LEFT JOIN public.user_roles ur ON ur.user_id = gga.guard_user_id
    WHERE gga.gate_id = p_gate_id;

    IF p_guard_user_id IS NOT NULL THEN
        INSERT INTO public.guard_gate_assignments (gate_id, guard_user_id, assigned_by, assigned_at, updated_at)
        VALUES (p_gate_id, p_guard_user_id, p_assigned_by, public.get_philippine_timestamp(), public.get_philippine_timestamp())
        ON CONFLICT (gate_id)
        DO UPDATE SET
            guard_user_id = EXCLUDED.guard_user_id,
            assigned_by = EXCLUDED.assigned_by,
            assigned_at = EXCLUDED.assigned_at,
            updated_at = EXCLUDED.updated_at;

        SELECT COALESCE(NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), ''), email, 'Unknown Guard')
        INTO new_guard_name
        FROM public.user_roles
        WHERE user_id = p_guard_user_id;
    ELSE
        DELETE FROM public.guard_gate_assignments
        WHERE gate_id = p_gate_id;

        new_guard_name := NULL;
    END IF;

    PERFORM public.log_action(
        p_assigned_by,
        'gate_update',
        jsonb_build_object(
            'update_type', 'guard_assignment',
            'gate_id', p_gate_id,
            'gate_name', gate_name,
            'old_guard_user_id', old_guard_id,
            'old_guard_name', old_guard_name,
            'new_guard_user_id', p_guard_user_id,
            'new_guard_name', new_guard_name,
            'updated_at', public.get_philippine_timestamp()
        )
    );

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_gate_guard_assignments(
    p_user_id UUID
)
RETURNS TABLE (
    gate_id UUID,
    gate_name TEXT,
    guard_user_id UUID,
    guard_name TEXT,
    guard_email TEXT,
    assigned_at TIMESTAMPTZ,
    assigned_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role user_role;
BEGIN
    SELECT role INTO requester_role
    FROM public.user_roles
    WHERE user_id = p_user_id;

    IF requester_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Only admins can view all gate assignments';
    END IF;

    RETURN QUERY
    SELECT g.id,
           g.name::TEXT,
           gga.guard_user_id,
           COALESCE(NULLIF(TRIM(CONCAT(ur.first_name, ' ', ur.last_name)), ''), ur.email, 'Unassigned')::TEXT,
           ur.email::TEXT,
           gga.assigned_at,
           gga.assigned_by
    FROM public.gates g
    LEFT JOIN public.guard_gate_assignments gga ON gga.gate_id = g.id
    LEFT JOIN public.user_roles ur ON ur.user_id = gga.guard_user_id
    ORDER BY g.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_assigned_gate_for_guard(
    p_guard_user_id UUID,
    p_requested_by UUID
)
RETURNS TABLE (
    gate_id UUID,
    gate_name TEXT,
    gate_type gate_type,
    gate_status gate_status,
    gate_location TEXT,
    assigned_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role user_role;
BEGIN
    SELECT role INTO requester_role
    FROM public.user_roles
    WHERE user_id = p_requested_by;

    IF requester_role NOT IN ('admin', 'guard') THEN
        RAISE EXCEPTION 'Unauthorized requester';
    END IF;

    IF requester_role = 'guard' AND p_guard_user_id IS DISTINCT FROM p_requested_by THEN
        RAISE EXCEPTION 'Guards can only view their own assignment';
    END IF;

    RETURN QUERY
    SELECT g.id,
           g.name::TEXT,
           g.gate_type,
           g.status,
           g.location::TEXT,
           gga.assigned_at
    FROM public.guard_gate_assignments gga
    JOIN public.gates g ON g.id = gga.gate_id
    WHERE gga.guard_user_id = p_guard_user_id
    ORDER BY gga.assigned_at DESC
    LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_assignable_gates_for_guard(
    p_requested_by UUID
)
RETURNS TABLE (
    gate_id UUID,
    gate_name TEXT,
    gate_type gate_type,
    gate_status gate_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role user_role;
BEGIN
    SELECT role INTO requester_role
    FROM public.user_roles
    WHERE user_id = p_requested_by;

    IF requester_role NOT IN ('admin', 'guard') THEN
        RAISE EXCEPTION 'Unauthorized requester';
    END IF;

    RETURN QUERY
    SELECT g.id, g.name::TEXT, g.gate_type, g.status
    FROM public.gates g
    ORDER BY g.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_guard_to_gate(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gate_guard_assignments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_assigned_gate_for_guard(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_assignable_gates_for_guard(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_assigned_guard_gate_settings(
    p_guard_user_id UUID,
    p_requested_by UUID,
    p_gate_type gate_type,
    p_status gate_status
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role user_role;
    assigned_gate_id UUID;
    gate_name TEXT;
    old_gate_type gate_type;
    old_status gate_status;
BEGIN
    SELECT role INTO requester_role
    FROM public.user_roles
    WHERE user_id = p_requested_by;

    IF requester_role NOT IN ('admin', 'guard') THEN
        RAISE EXCEPTION 'Unauthorized requester';
    END IF;

    IF requester_role = 'guard' AND p_guard_user_id IS DISTINCT FROM p_requested_by THEN
        RAISE EXCEPTION 'Guards can only update their own gate settings';
    END IF;

    SELECT g.id, g.name, g.gate_type, g.status
    INTO assigned_gate_id, gate_name, old_gate_type, old_status
    FROM public.guard_gate_assignments gga
    JOIN public.gates g ON g.id = gga.gate_id
    WHERE gga.guard_user_id = p_guard_user_id
    ORDER BY gga.assigned_at DESC
    LIMIT 1;

    IF assigned_gate_id IS NULL THEN
        RAISE EXCEPTION 'No gate assignment found for this guard';
    END IF;

    UPDATE public.gates
    SET gate_type = p_gate_type,
        status = p_status,
        updated_at = public.get_philippine_timestamp(),
        updated_by = p_requested_by
    WHERE id = assigned_gate_id;

    PERFORM public.log_action(
        p_requested_by,
        'gate_update',
        jsonb_build_object(
            'gate_id', assigned_gate_id,
            'gate_name', gate_name,
            'old_gate_type', old_gate_type,
            'new_gate_type', p_gate_type,
            'old_status', old_status,
            'new_status', p_status,
            'update_type', 'guard_gate_settings',
            'updated_at', public.get_philippine_timestamp()
        )
    );

    IF old_status IS DISTINCT FROM p_status THEN
        PERFORM public.log_action(
            p_requested_by,
            'gate_status_change',
            jsonb_build_object(
                'gate_id', assigned_gate_id,
                'gate_name', gate_name,
                'old_status', old_status,
                'new_status', p_status,
                'updated_at', public.get_philippine_timestamp(),
                'changed_by_role', requester_role
            )
        );
    END IF;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_assigned_guard_gate_settings(UUID, UUID, gate_type, gate_status) TO authenticated;
