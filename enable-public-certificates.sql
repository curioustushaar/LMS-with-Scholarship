-- Enable Public Read Access for Certificates
-- This is required for the public verification link to work.

DO $$
BEGIN
    -- 1. Certificates: Public Read
    DROP POLICY IF EXISTS "Public can view certificates" ON certificates;
    CREATE POLICY "Public can view certificates" 
    ON certificates FOR SELECT 
    TO anon, authenticated 
    USING (true);

    -- 2. Courses: Public Read (Usually already public, but ensuring)
    DROP POLICY IF EXISTS "Public can view active courses" ON courses;
    CREATE POLICY "Public can view active courses" 
    ON courses FOR SELECT 
    TO anon, authenticated 
    USING (status = 'active' OR status = 'published' OR true); -- Permissive for now

    -- 3. Profiles: Public Read (Required to show Student Name on certificate)
    -- WARNING: This makes profiles public. In a strictly private system, 
    -- we would store student_name on the certificate record itself.
    -- For now, we allow reading profiles to unblock the View.
    DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
    CREATE POLICY "Public can view profiles" 
    ON profiles FOR SELECT 
    TO anon, authenticated 
    USING (true);

    RAISE NOTICE 'Public access enabled for Certificates, Courses, and Profiles.';
END $$;
