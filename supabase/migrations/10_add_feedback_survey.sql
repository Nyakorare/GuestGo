-- Add feedback survey functionality
-- Create table to store visitor feedback for completed visits

-- Drop existing table if it exists (for migration updates)
DROP TABLE IF EXISTS visit_feedback CASCADE;

CREATE TABLE visit_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_id UUID REFERENCES scheduled_visits(id) ON DELETE CASCADE,
    visitor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    visitor_email VARCHAR(255) NOT NULL,
    
    -- ISO 25010 Quality Characteristics
    functional_suitability INTEGER CHECK (functional_suitability >= 1 AND functional_suitability <= 5),
    performance_efficiency INTEGER CHECK (performance_efficiency >= 1 AND performance_efficiency <= 5),
    compatibility INTEGER CHECK (compatibility >= 1 AND compatibility <= 5),
    usability INTEGER CHECK (usability >= 1 AND usability <= 5),
    reliability INTEGER CHECK (reliability >= 1 AND reliability <= 5),
    security INTEGER CHECK (security >= 1 AND security <= 5),
    maintainability INTEGER CHECK (maintainability >= 1 AND maintainability <= 5),
    portability INTEGER CHECK (portability >= 1 AND portability <= 5),
    
    -- Additional feedback
    overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
    comments TEXT,
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    
    -- Ensure one feedback per visit
    UNIQUE(visit_id)
);

-- Add index for faster queries
CREATE INDEX idx_visit_feedback_visit_id ON visit_feedback(visit_id);
CREATE INDEX idx_visit_feedback_visitor_email ON visit_feedback(visitor_email);
CREATE INDEX idx_visit_feedback_submitted_at ON visit_feedback(submitted_at);

-- Add RLS policies
ALTER TABLE visit_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Visitors can only submit feedback for their own visits
CREATE POLICY "Visitors can submit feedback for their own visits" ON visit_feedback
    FOR INSERT WITH CHECK (
        auth.uid() = visitor_user_id OR 
        visitor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Visitors can view their own feedback
CREATE POLICY "Visitors can view their own feedback" ON visit_feedback
    FOR SELECT USING (
        auth.uid() = visitor_user_id OR 
        visitor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Personnel and admins can view all feedback
CREATE POLICY "Personnel and admins can view all feedback" ON visit_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('personnel', 'admin')
        )
    );

-- Policy: Allow service role to access all feedback (for admin functions)
CREATE POLICY "Service role can access all feedback" ON visit_feedback
    FOR ALL USING (true);

-- Function to check if feedback already exists for a visit
CREATE OR REPLACE FUNCTION has_feedback_for_visit(p_visit_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM visit_feedback 
        WHERE visit_id = p_visit_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit feedback
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
    
    -- Log the feedback submission
    PERFORM log_action(
        COALESCE(visit_record.visitor_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
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

-- Update log_action enum to include feedback submission
-- Only add if it doesn't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'visit_feedback_submitted' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'log_action')) THEN
        ALTER TYPE log_action ADD VALUE 'visit_feedback_submitted';
    END IF;
END $$;

-- Function to get feedback statistics (for admin/personnel)
CREATE OR REPLACE FUNCTION get_feedback_statistics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_feedback', COUNT(*),
        'average_ratings', jsonb_build_object(
            'functional_suitability', ROUND(AVG(functional_suitability), 2),
            'performance_efficiency', ROUND(AVG(performance_efficiency), 2),
            'compatibility', ROUND(AVG(compatibility), 2),
            'usability', ROUND(AVG(usability), 2),
            'reliability', ROUND(AVG(reliability), 2),
            'security', ROUND(AVG(security), 2),
            'maintainability', ROUND(AVG(maintainability), 2),
            'portability', ROUND(AVG(portability), 2),
            'overall_satisfaction', ROUND(AVG(overall_satisfaction), 2)
        ),
        'feedback_with_comments', COUNT(*) FILTER (WHERE comments IS NOT NULL AND length(trim(comments)) > 0),
        'recent_feedback', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', vf.id,
                    'visit_id', vf.visit_id,
                    'visitor_name', sv.visitor_first_name || ' ' || sv.visitor_last_name,
                    'overall_satisfaction', vf.overall_satisfaction,
                    'submitted_at', vf.submitted_at,
                    'has_comments', vf.comments IS NOT NULL AND length(trim(vf.comments)) > 0
                )
            )
            FROM visit_feedback vf
            JOIN scheduled_visits sv ON vf.visit_id = sv.id
            ORDER BY vf.submitted_at DESC
            LIMIT 10
        )
    ) INTO result
    FROM visit_feedback;
    
    RETURN COALESCE(result, jsonb_build_object('total_feedback', 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all feedback for admin dashboard (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_feedback_for_admin()
RETURNS TABLE (
    id UUID,
    visit_id UUID,
    visitor_user_id UUID,
    visitor_email VARCHAR(255),
    functional_suitability INTEGER,
    performance_efficiency INTEGER,
    compatibility INTEGER,
    usability INTEGER,
    reliability INTEGER,
    security INTEGER,
    maintainability INTEGER,
    portability INTEGER,
    overall_satisfaction INTEGER,
    comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    visitor_first_name VARCHAR(100),
    visitor_last_name VARCHAR(100),
    visit_date DATE
) AS $$
BEGIN
    -- Check if user is admin or personnel
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'personnel')
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin or personnel role required.';
    END IF;
    
    RETURN QUERY
    SELECT 
        vf.id,
        vf.visit_id,
        vf.visitor_user_id,
        vf.visitor_email,
        vf.functional_suitability,
        vf.performance_efficiency,
        vf.compatibility,
        vf.usability,
        vf.reliability,
        vf.security,
        vf.maintainability,
        vf.portability,
        vf.overall_satisfaction,
        vf.comments,
        vf.submitted_at,
        vf.ip_address,
        vf.user_agent,
        sv.visitor_first_name,
        sv.visitor_last_name,
        sv.visit_date
    FROM visit_feedback vf
    JOIN scheduled_visits sv ON vf.visit_id = sv.id
    ORDER BY vf.submitted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get places for a specific visit (for admin dashboard)
CREATE OR REPLACE FUNCTION get_visit_places_for_admin(p_visit_id UUID)
RETURNS TABLE (
    place_id UUID,
    place_name VARCHAR(255)
) AS $$
BEGIN
    -- Check if user is admin or personnel
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'personnel')
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin or personnel role required.';
    END IF;
    
    RETURN QUERY
    SELECT 
        svp.place_id,
        ptv.name as place_name
    FROM scheduled_visit_places svp
    JOIN places_to_visit ptv ON svp.place_id = ptv.id
    WHERE svp.visit_id = p_visit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
