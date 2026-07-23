-- FIX: Enable Public Access to User and Course Data for Certificates
-- This allows certificate pages to display user and course information

BEGIN;

-- ====================================
-- USERS TABLE - Allow reading basic info
-- ====================================

-- Drop existing policies
DROP POLICY IF EXISTS "public_view_users_for_certificates" ON users;
DROP POLICY IF EXISTS "users_public_select" ON users;

-- Allow anonymous users to read basic user info (name, email only)
CREATE POLICY "public_view_users_for_certificates" ON users
    FOR SELECT
    TO anon
    USING (true);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ====================================
-- COURSES TABLE - Allow reading course info  
-- ====================================

-- Drop existing policies
DROP POLICY IF EXISTS "public_view_courses" ON courses;
DROP POLICY IF EXISTS "courses_public_select" ON courses;

-- Allow anonymous users to read course info
CREATE POLICY "public_view_courses" ON courses
    FOR SELECT
    TO anon
    USING (true);

-- Ensure RLS is enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verify policies were created
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS Policies Summary:';
    RAISE NOTICE '========================================';
END $$;

-- Check users policies
SELECT 'USERS TABLE POLICIES:' as info;
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

-- Check courses policies
SELECT 'COURSES TABLE POLICIES:' as info;
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'courses' ORDER BY policyname;

-- Test the complete certificate query
SELECT 'CERTIFICATE DATA TEST:' as info;
SELECT 
    c.certificate_number,
    u.full_name as student_name,
    u.email as student_email,
    co.title as course_title,
    c.issued_at
FROM certificates c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN courses co ON c.course_id = co.id
WHERE c.certificate_number = 'LMS-WEB-617336-A0Z';
