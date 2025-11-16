-- Function to get a single random public feedback that changes daily
-- This function returns one feedback with comments, selected randomly but consistently for each day
CREATE OR REPLACE FUNCTION get_public_feedback()
RETURNS TABLE (
    id UUID,
    visitor_name VARCHAR(255),
    comments TEXT,
    overall_satisfaction INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    today_date DATE;
    feedback_count INTEGER;
    random_offset INTEGER;
BEGIN
    -- Get today's date
    today_date := CURRENT_DATE;
    
    -- Count total feedback with comments and positive ratings
    SELECT COUNT(*) INTO feedback_count
    FROM visit_feedback vf
    JOIN scheduled_visits sv ON vf.visit_id = sv.id
    WHERE vf.comments IS NOT NULL 
        AND length(trim(vf.comments)) > 0
        AND vf.overall_satisfaction >= 4;
    
    -- If no feedback available, return empty
    IF feedback_count = 0 THEN
        RETURN;
    END IF;
    
    -- Use today's date as seed for consistent random selection throughout the day
    -- This ensures the same feedback is shown all day, but changes the next day
    random_offset := (EXTRACT(EPOCH FROM today_date)::INTEGER % feedback_count);
    
    RETURN QUERY
    SELECT 
        vf.id,
        COALESCE(
            sv.visitor_first_name || ' ' || sv.visitor_last_name,
            'Anonymous'
        ) as visitor_name,
        vf.comments,
        vf.overall_satisfaction,
        vf.submitted_at
    FROM visit_feedback vf
    JOIN scheduled_visits sv ON vf.visit_id = sv.id
    WHERE vf.comments IS NOT NULL 
        AND length(trim(vf.comments)) > 0
        AND vf.overall_satisfaction >= 4
    ORDER BY vf.submitted_at DESC
    OFFSET random_offset
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_public_feedback() TO anon, authenticated;

-- Add public policy to allow reading feedback with comments (for public display)
CREATE POLICY "Public can view feedback with comments" ON visit_feedback
    FOR SELECT USING (
        comments IS NOT NULL 
        AND length(trim(comments)) > 0
        AND overall_satisfaction >= 4
    );

