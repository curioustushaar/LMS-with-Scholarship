-- Fix Certificate RLS to use JWT Metadata
-- This avoids the issue where public.users/profiles record is missing.

DO $$
BEGIN
    -- 1. Drop existing policies
    DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
    DROP POLICY IF EXISTS "Admins can manage certificates" ON certificates;

    -- 2. Create JWT-based Admin Policy
    -- This checks user_metadata->role inside the Auth Token directly
    CREATE POLICY "Admins can manage all certificates" 
    ON certificates FOR ALL 
    TO authenticated 
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR
        -- Keep fallback to DB tables just in case
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

    RAISE NOTICE 'RLS Policies Updated to use JWT.';
END $$;
