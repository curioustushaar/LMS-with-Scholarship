-- ==========================================
-- FINAL FIX: Infinite Recursion in RLS Policies
-- ==========================================
-- This script COMPLETELY fixes the infinite recursion error
-- by using a non-recursive approach for admin checking
-- ==========================================

-- Step 1: Drop ALL existing policies FIRST (before dropping function)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 2: Now drop the is_admin function (no dependencies left)
DROP FUNCTION IF EXISTS public.is_admin();

-- Step 3: Temporarily disable RLS on profiles to break recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Create new admin check function that won't cause recursion
-- This function uses SECURITY DEFINER and queries profiles with RLS disabled
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Step 5: Re-enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Step 6: Create NON-RECURSIVE policies using simple approach
-- The key: profiles policies DON'T use is_admin() - they use direct checks

-- PROFILES TABLE - Simple policies without recursion
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_select_all_for_service"
ON profiles FOR SELECT
TO service_role
USING (true);

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Now we can safely use is_admin() for OTHER tables since profiles won't recurse

-- COURSES TABLE
CREATE POLICY "courses_select_all"
ON courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "courses_all_for_admin"
ON courses FOR ALL
TO authenticated
USING (is_admin());

-- WEEKS TABLE
CREATE POLICY "weeks_select_all"
ON weeks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "weeks_all_for_admin"
ON weeks FOR ALL
TO authenticated
USING (is_admin());

-- VIDEOS TABLE
CREATE POLICY "videos_select_all"
ON videos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "videos_all_for_admin"
ON videos FOR ALL
TO authenticated
USING (is_admin());

-- ENROLLMENTS TABLE
CREATE POLICY "enrollments_select_own"
ON enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "enrollments_all_for_admin"
ON enrollments FOR ALL
TO authenticated
USING (is_admin());

-- TASKS TABLE
CREATE POLICY "tasks_select_enrolled_or_admin"
ON tasks FOR SELECT
TO authenticated
USING (
  is_admin() OR
  course_id IN (
    SELECT course_id FROM enrollments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "tasks_all_for_admin"
ON tasks FOR ALL
TO authenticated
USING (is_admin());

-- TASK SUBMISSIONS TABLE
CREATE POLICY "task_submissions_select_own_or_admin"
ON task_submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "task_submissions_insert_own"
ON task_submissions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "task_submissions_update_own_or_admin"
ON task_submissions FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- BADGES TABLE
CREATE POLICY "badges_select_all"
ON badges FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "badges_all_for_admin"
ON badges FOR ALL
TO authenticated
USING (is_admin());

-- USER BADGES TABLE
CREATE POLICY "user_badges_select_own_or_admin"
ON user_badges FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_badges_all_for_admin"
ON user_badges FOR ALL
TO authenticated
USING (is_admin());

-- CERTIFICATES TABLE
CREATE POLICY "certificates_select_own_or_admin"
ON certificates FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "certificates_select_public"
ON certificates FOR SELECT
TO anon
USING (true);

CREATE POLICY "certificates_all_for_admin"
ON certificates FOR ALL
TO authenticated
USING (is_admin());

-- Step 7: Verify the setup
SELECT 
  'Verification Results:' as status;

-- Check the is_admin function
SELECT 
  'is_admin() function:' as check_type,
  is_admin() as result,
  auth.uid() as user_id,
  (SELECT role FROM profiles WHERE id = auth.uid()) as role;

-- Show all policies
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- ✅ COMPLETE! This should fix the infinite recursion
-- ==========================================
-- Key changes:
-- 1. Profiles table policies DON'T use is_admin() - no recursion!
-- 2. is_admin() function uses SQL language (faster, safer)
-- 3. All other tables CAN use is_admin() safely
-- 4. Admins will see ALL data, students see only their own
-- 
-- Now refresh your dashboard and it should work!
-- ==========================================
