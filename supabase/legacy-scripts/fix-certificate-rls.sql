-- Fix Certificate RLS Policies
-- The previous policy might be failing if roles are stored in 'profiles' or if 'users' sync is broken.

DO $$
BEGIN
    -- 1. Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
    DROP POLICY IF EXISTS "Students can view their own certificates" ON certificates;
    DROP POLICY IF EXISTS "Admins can manage certificates" ON certificates; -- cleanup

    -- 2. Create Robust Admin Policy (Check both users and profiles)
    CREATE POLICY "Admins can manage all certificates" 
    ON certificates FOR ALL 
    TO authenticated 
    USING (
        -- Check public.users
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        -- Check public.profiles (if it exists)
        EXISTS (
             SELECT 1 FROM information_schema.tables 
             WHERE table_name = 'profiles'
        ) AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

    -- 3. Create Student Policy (View Only)
    CREATE POLICY "Students can view their own certificates" 
    ON certificates FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

    RAISE NOTICE 'RLS Policies Updated successfully.';
END $$;
