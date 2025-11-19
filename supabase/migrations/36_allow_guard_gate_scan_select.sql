-- Allow guards to read gate scans for face verification workflows
DROP POLICY IF EXISTS "Users can view gate scans with face images for their visits" ON gate_scans;

CREATE POLICY "Users can view gate scans with face images for their visits" ON gate_scans
    FOR SELECT USING (
        scanned_by = auth.uid() OR
        visit_id IN (
            SELECT id FROM scheduled_visits 
            WHERE visitor_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'log', 'guard')
        )
    );

