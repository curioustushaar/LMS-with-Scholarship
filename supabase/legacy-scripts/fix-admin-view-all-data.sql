-- ==========================================
-- FIX: Admin Can't See Dashboard Data
-- ==========================================
-- This adds admin access to view all profiles and data
-- IMPORTANT: Run fix-dashboard-rls-final.sql FIRST if you haven't!
-- ==========================================

-- Drop the restrictive profiles_select_own policy
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

-- Add new policy: users can see own profile OR admin can see all
CREATE POLICY "profiles_select_own_or_admin"
ON profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR is_admin()
);

-- Drop old update policy and add admin update access
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR is_admin())
WITH CHECK (id = auth.uid() OR is_admin());

-- Add admin INSERT policy for profiles
CREATE POLICY "profiles_insert_for_admin"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Add admin DELETE policy for profiles
CREATE POLICY "profiles_delete_for_admin"
ON profiles FOR DELETE
TO authenticated
USING (is_admin());

-- Verify policies
SELECT 
  'Profiles RLS Policies:' as info;

SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Test query: Count all students (should work for admin now)
SELECT 
  'Test Query - Total Students:' as info,
  COUNT(*) as total_students
FROM profiles
WHERE role = 'student';

-- ==========================================
-- ✅ Run this in Supabase SQL Editor
-- ==========================================
-- This will allow admin to:
-- • View ALL student profiles (dashboard will show counts)
-- • Create/Update/Delete profiles
-- • Manage all student data
--
-- After running:
-- 1. Refresh dashboard (F5)
-- 2. Should show Total Students count
-- 3. Task submissions should be visible
-- ==========================================
