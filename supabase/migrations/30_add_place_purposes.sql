-- Create place_purposes table to store visit purposes for each place
CREATE TABLE IF NOT EXISTS place_purposes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id UUID REFERENCES places_to_visit(id) ON DELETE CASCADE,
    purpose VARCHAR(255) NOT NULL,
    required_days INTEGER NOT NULL CHECK (required_days >= 0 AND required_days <= 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(place_id, purpose)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_place_purposes_place_id ON place_purposes(place_id);
CREATE INDEX IF NOT EXISTS idx_place_purposes_required_days ON place_purposes(required_days);

-- Add RLS policies
ALTER TABLE place_purposes ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view place purposes
DROP POLICY IF EXISTS "Authenticated users can view place purposes" ON place_purposes;
CREATE POLICY "Authenticated users can view place purposes" ON place_purposes
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can insert place purposes
DROP POLICY IF EXISTS "Admins can insert place purposes" ON place_purposes;
CREATE POLICY "Admins can insert place purposes" ON place_purposes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can update place purposes
DROP POLICY IF EXISTS "Admins can update place purposes" ON place_purposes;
CREATE POLICY "Admins can update place purposes" ON place_purposes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can delete place purposes
DROP POLICY IF EXISTS "Admins can delete place purposes" ON place_purposes;
CREATE POLICY "Admins can delete place purposes" ON place_purposes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Add comment explaining the table
COMMENT ON TABLE place_purposes IS 'Stores visit purposes for each place with required advance notice in days';
COMMENT ON COLUMN place_purposes.place_id IS 'Reference to the place this purpose applies to';
COMMENT ON COLUMN place_purposes.purpose IS 'The purpose type for the visit (e.g., "Meeting", "Tour", "Inspection")';
COMMENT ON COLUMN place_purposes.required_days IS 'Number of days advance notice required (0-6, where 0 = same day allowed)';

