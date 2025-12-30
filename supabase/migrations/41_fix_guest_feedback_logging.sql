-- Fix guest feedback logging to allow NULL user_id
-- This allows non-logged-in users (guests) to submit feedback without foreign key constraint violations

-- Update log_action function to accept NULL user_id
CREATE OR REPLACE FUNCTION public.log_action(
    p_user_id UUID,
    p_action log_action,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.logs (user_id, action, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update submit_visit_feedback function to pass NULL instead of dummy UUID for guest visits
CREATE OR REPLACE FUNCTION submit_visit_feedback(
    p_visit_id UUID,
    p_functional_suitability INTEGER,
    p_performance_efficiency INTEGER,
    p_compatibility INTEGER,
    p_usability INTEGER,
    p_reliability INTEGER,
    p_security INTEGER,
    p_maintainability INTEGER,
    p_portability INTEGER,
    p_overall_satisfaction INTEGER,
    p_comments TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    visit_record RECORD;
    feedback_id UUID;
    result JSONB;
BEGIN
    -- Get visit details
    SELECT * INTO visit_record FROM scheduled_visits WHERE id = p_visit_id;
    
    IF visit_record.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Visit not found');
    END IF;
    
    -- Check if visit is completed
    IF visit_record.status != 'completed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Feedback can only be submitted for completed visits');
    END IF;
    
    -- Check if feedback already exists
    IF has_feedback_for_visit(p_visit_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Feedback has already been submitted for this visit');
    END IF;
    
    -- Validate ratings (1-5 scale)
    IF p_functional_suitability < 1 OR p_functional_suitability > 5 OR
       p_performance_efficiency < 1 OR p_performance_efficiency > 5 OR
       p_compatibility < 1 OR p_compatibility > 5 OR
       p_usability < 1 OR p_usability > 5 OR
       p_reliability < 1 OR p_reliability > 5 OR
       p_security < 1 OR p_security > 5 OR
       p_maintainability < 1 OR p_maintainability > 5 OR
       p_portability < 1 OR p_portability > 5 OR
       p_overall_satisfaction < 1 OR p_overall_satisfaction > 5 THEN
        RETURN jsonb_build_object('success', false, 'error', 'All ratings must be between 1 and 5');
    END IF;
    
    -- Insert feedback
    INSERT INTO visit_feedback (
        visit_id,
        visitor_user_id,
        visitor_email,
        functional_suitability,
        performance_efficiency,
        compatibility,
        usability,
        reliability,
        security,
        maintainability,
        portability,
        overall_satisfaction,
        comments,
        ip_address,
        user_agent
    ) VALUES (
        p_visit_id,
        visit_record.visitor_user_id,
        visit_record.visitor_email,
        p_functional_suitability,
        p_performance_efficiency,
        p_compatibility,
        p_usability,
        p_reliability,
        p_security,
        p_maintainability,
        p_portability,
        p_overall_satisfaction,
        p_comments,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    ) RETURNING id INTO feedback_id;
    
    -- Log the feedback submission (pass NULL for guest visits instead of dummy UUID)
    PERFORM log_action(
        visit_record.visitor_user_id,  -- This will be NULL for guest visits, which is allowed
        'visit_feedback_submitted',
        jsonb_build_object(
            'visit_id', p_visit_id,
            'feedback_id', feedback_id,
            'visitor_name', visit_record.visitor_first_name || ' ' || visit_record.visitor_last_name,
            'visitor_email', visit_record.visitor_email,
            'overall_satisfaction', p_overall_satisfaction,
            'has_comments', p_comments IS NOT NULL AND length(trim(p_comments)) > 0
        )
    );
    
    RETURN jsonb_build_object(
        'success', true, 
        'feedback_id', feedback_id,
        'message', 'Feedback submitted successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

