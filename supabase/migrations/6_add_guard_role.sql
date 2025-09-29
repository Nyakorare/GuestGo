-- Add guard role to the user_role enum
ALTER TYPE user_role ADD VALUE 'guard';

-- Add any additional tables or functions needed for guard functionality
-- (if needed in the future)
-- Create function to log guard actions (entrance/exit)
CREATE OR REPLACE FUNCTION public.log_guard_action(
    p_visit_id UUID,
    p_action TEXT,
    p_guard_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    log_id UUID;
    visit_exists BOOLEAN;
    guard_role TEXT;
BEGIN
    -- Check if the user is a guard
    SELECT role INTO guard_role 
    FROM user_roles 
    WHERE user_id = p_guard_id;
    
    IF guard_role != 'guard' THEN
        RAISE EXCEPTION 'Only guards can log entrance/exit actions';
    END IF;
    
    -- Check if visit exists
    SELECT EXISTS(SELECT 1 FROM scheduled_visits WHERE id = p_visit_id) INTO visit_exists;
    
    IF NOT visit_exists THEN
        RAISE EXCEPTION 'Visit not found';
    END IF;
    
    -- Validate action type
    IF p_action NOT IN ('entrance', 'exit') THEN
        RAISE EXCEPTION 'Invalid action type. Must be "entrance" or "exit"';
    END IF;
    
    -- Log the guard action
    log_id := public.log_action(
        p_guard_id,
        'guard_action',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'action', p_action,
            'guard_id', p_guard_id,
            'timestamp', CURRENT_TIMESTAMP
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add guard_action to the log_action enum
ALTER TYPE log_action ADD VALUE 'guard_action';
