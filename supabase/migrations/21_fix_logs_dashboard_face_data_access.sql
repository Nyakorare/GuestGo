-- Fix RLS policy to allow admin and log users to view all gate scans for face data
-- This migration updates the gate_scans RLS policy to allow logs dashboard access

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view gate scans with face images for their visits" ON gate_scans;

-- Create a new policy that allows:
-- 1. Users to view their own scans (visitor role)
-- 2. Admin and log users to view all scans (for logs dashboard)
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
            AND role IN ('admin', 'log')
        )
    );
