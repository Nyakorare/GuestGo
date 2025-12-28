-- Allow anonymous (non-logged-in) users to read place purposes
-- This is needed so that non-logged-in users can see available purposes when scheduling visits

BEGIN;

-- Add policy to allow anonymous users to view place purposes
DROP POLICY IF EXISTS "Anonymous users can view place purposes" ON place_purposes;
CREATE POLICY "Anonymous users can view place purposes" ON place_purposes
    FOR SELECT USING (true);

-- Note: The existing "Authenticated users can view place purposes" policy will still work
-- for authenticated users. This new policy allows anyone (including anonymous users) to read
-- place purposes, which is necessary for the scheduling modal to work for non-logged-in users.

COMMIT;

