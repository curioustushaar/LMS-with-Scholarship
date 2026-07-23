-- ==========================================
-- COMPLETE FIX: Admin Can See ALL Data
-- ==========================================
-- This fixes admin access to profiles AND task_submissions
-- so dashboard and submissions page both work correctly
-- ==========================================

-- ==========================================
-- STEP 1: Fix Profiles Table (for dashboard student counts)
-- ==========================================

-- Drop ALL existing policies for profiles (including duplicates)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all_for_service" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_for_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_for_admin" ON profiles;

-- Create new policies with admin access
CREATE POLICY "profiles_select_own_or_admin"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR is_admin())
WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_insert_for_admin"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "profiles_delete_for_admin"
ON profiles FOR DELETE
TO authenticated
USING (is_admin());

-- ==========================================
-- STEP 2: Fix Task Submissions Table (for submissions page)
-- ==========================================

-- Drop ALL existing policies for task_submissions (including duplicates)
DROP POLICY IF EXISTS "task_submissions_select_own_or_admin" ON task_submissions;
DROP POLICY IF EXISTS "Students can view own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admin can view all submissions" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_insert_own" ON task_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_update_own_or_admin" ON task_submissions;
DROP POLICY IF EXISTS "Students can update own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admin can update submissions" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_select_policy" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_insert_policy" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_update_policy" ON task_submissions;
DROP POLICY IF EXISTS "task_submissions_delete_policy" ON task_submissions;

-- Create new comprehensive policies
-- SELECT: Students see own, Admin sees all
CREATE POLICY "task_submissions_select_policy"
ON task_submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

-- INSERT: Students can submit their own
CREATE POLICY "task_submissions_insert_policy"
ON task_submissions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Students can update own (before evaluation), Admin can update all
CREATE POLICY "task_submissions_update_policy"
ON task_submissions FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- DELETE: Only admin can delete
CREATE POLICY "task_submissions_delete_policy"
ON task_submissions FOR DELETE
TO authenticated
USING (is_admin());

-- ==========================================
-- STEP 3: Verify All Policies
-- ==========================================

SELECT '=== PROFILES POLICIES ===' as info;
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY cmd, policyname;

SELECT '=== TASK SUBMISSIONS POLICIES ===' as info;
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'task_submissions'
ORDER BY cmd, policyname;

-- Test queries (run as admin)
SELECT '=== TEST: Count Students ===' as info;
SELECT COUNT(*) as total_students FROM profiles WHERE role = 'student';

SELECT '=== TEST: Count Task Submissions ===' as info;
SELECT COUNT(*) as total_submissions FROM task_submissions;

SELECT '=== TEST: Submissions by Status ===' as info;
SELECT status, COUNT(*) as count 
FROM task_submissions 
GROUP BY status
ORDER BY status;

-- ==========================================
-- ✅ COMPLETE! Run this in Supabase SQL Editor
-- ==========================================
-- After running this script:
-- 1. Dashboard will show correct student counts
-- 2. Task Submissions page will show all submissions
-- 3. Admin will have full access to all data
-- 4. Students will only see their own data
--
-- Then refresh your browser:
-- - Dashboard: Ctrl+Shift+R
-- - Submissions page: Ctrl+Shift+R
-- ==========================================
