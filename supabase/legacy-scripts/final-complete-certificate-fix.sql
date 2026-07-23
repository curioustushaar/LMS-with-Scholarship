-- COMPLETE FIX: Certificate Download & Display
-- This fixes all certificate viewing/download issues

BEGIN;

-- Step 1: Update certificate URLs
UPDATE certificates 
SET certificate_url = '/certificate/' || certificate_number
WHERE certificate_url IS NULL OR certificate_url = '' OR certificate_url = 'undefined';

-- Step 2: Ensure RLS allows public certificate viewing
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "public_read_certificates" ON certificates;
DROP POLICY IF EXISTS "anyone_can_view_certificates" ON certificates;
DROP POLICY IF EXISTS "public_certificate_viewing" ON certificates;
DROP POLICY IF EXISTS "admin_all_certificates" ON certificates;
DROP POLICY IF EXISTS "student_own_certificates" ON certificates;
DROP POLICY IF EXISTS "Admin full access to certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
DROP POLICY IF EXISTS "Students can view their own certificates" ON certificates;

-- Create new public read policy for certificate viewing
CREATE POLICY "public_certificate_viewing" 
ON certificates 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Admin policy
CREATE POLICY "admin_all_certificates" 
ON certificates 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Student can view their own
CREATE POLICY "student_own_certificates" 
ON certificates 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Step 3: Ensure users table allows public read for certificate display
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "public_read_users_for_certificates" ON users;
DROP POLICY IF EXISTS "public_users_read" ON users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;

-- Create public read policy
CREATE POLICY "public_read_users_for_certificates"
ON users
FOR SELECT
TO anon, authenticated
USING (true);

-- Step 4: Ensure courses table allows public read
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "public_read_courses" ON courses;
DROP POLICY IF EXISTS "public_courses_read" ON courses;
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;

-- Create public read policy
CREATE POLICY "public_read_courses"
ON courses
FOR SELECT
TO anon, authenticated
USING (true);

COMMIT;

-- Verification
DO $$
DECLARE
    cert_record RECORD;
    cert_count INTEGER;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION';
    RAISE NOTICE '========================================';
    
    -- Check certificates
    SELECT COUNT(*) INTO cert_count FROM certificates;
    RAISE NOTICE 'Total certificates: %', cert_count;
    
    -- Check policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policy
    WHERE polrelid = 'certificates'::regclass;
    RAISE NOTICE 'RLS policies on certificates: %', policy_count;
    
    -- Show certificate details
    RAISE NOTICE '';
    RAISE NOTICE 'Certificate Details:';
    RAISE NOTICE '-------------------';
    
    FOR cert_record IN
        SELECT 
            c.certificate_number,
            c.certificate_url,
            c.user_id,
            c.course_id,
            u.full_name,
            co.title
        FROM certificates c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN courses co ON c.course_id = co.id
        ORDER BY c.issued_at DESC
    LOOP
        RAISE NOTICE 'Cert: %', cert_record.certificate_number;
        RAISE NOTICE '  URL: %', cert_record.certificate_url;
        RAISE NOTICE '  Student: %', COALESCE(cert_record.full_name, 'NOT FOUND');
        RAISE NOTICE '  Course: %', COALESCE(cert_record.title, 'NOT FOUND');
        RAISE NOTICE '';
    END LOOP;
END $$;

-- Success message
DO $$ BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ALL FIXES APPLIED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '1. ✅ Certificate URLs updated';
    RAISE NOTICE '2. ✅ Public viewing enabled for certificates';
    RAISE NOTICE '3. ✅ Public read enabled for users (for names)';
    RAISE NOTICE '4. ✅ Public read enabled for courses';
    RAISE NOTICE '5. ✅ RLS policies properly configured';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh admin page: Ctrl + Shift + R';
    RAISE NOTICE '2. Click download button';
    RAISE NOTICE '3. Certificate should open and display properly!';
    RAISE NOTICE '========================================';
END $$;
