-- Allow assigned personnel to edit place purposes in addition to admins
-- Updates RLS policies to allow personnel assigned to a place to insert, update, and delete purposes

BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert place purposes" ON place_purposes;
DROP POLICY IF EXISTS "Admins can update place purposes" ON place_purposes;
DROP POLICY IF EXISTS "Admins can delete place purposes" ON place_purposes;

-- Policy: Admins and assigned personnel can insert place purposes
CREATE POLICY "Admins and assigned personnel can insert place purposes" ON place_purposes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM place_personnel pp
            JOIN user_roles ur ON pp.personnel_id = ur.user_id
            WHERE pp.place_id = place_purposes.place_id
            AND pp.personnel_id = auth.uid()
            AND ur.role = 'personnel'
        )
    );

-- Policy: Admins and assigned personnel can update place purposes
CREATE POLICY "Admins and assigned personnel can update place purposes" ON place_purposes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM place_personnel pp
            JOIN user_roles ur ON pp.personnel_id = ur.user_id
            WHERE pp.place_id = place_purposes.place_id
            AND pp.personnel_id = auth.uid()
            AND ur.role = 'personnel'
        )
    );

-- Policy: Admins and assigned personnel can delete place purposes
CREATE POLICY "Admins and assigned personnel can delete place purposes" ON place_purposes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM place_personnel pp
            JOIN user_roles ur ON pp.personnel_id = ur.user_id
            WHERE pp.place_id = place_purposes.place_id
            AND pp.personnel_id = auth.uid()
            AND ur.role = 'personnel'
        )
    );

COMMIT;

