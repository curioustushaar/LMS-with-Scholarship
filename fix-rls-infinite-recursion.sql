-- ==========================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ==========================================
-- This script fixes the "infinite recursion detected in policy" error
-- by creating a security definer function to safely check admin role
-- 
-- Error: Infinite recursion occurs when policies check the same table
-- they're protecting (e.g., profiles policy checking profiles table)
-- 
-- Solution: Use SECURITY DEFINER function that bypasses RLS
-- ==========================================

-- Step 1: Create a function to check if current user is admin
-- SECURITY DEFINER means it runs with the creator's privileges, bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ==========================================
-- Step 2: Drop all existing policies
-- ==========================================

-- Profiles policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Courses policies
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;

-- Weeks policies
DROP POLICY IF EXISTS "Everyone can view weeks" ON weeks;
DROP POLICY IF EXISTS "Admin can manage weeks" ON weeks;

-- Videos policies
DROP POLICY IF EXISTS "Everyone can view videos" ON videos;
DROP POLICY IF EXISTS "Admin can manage videos" ON videos;

-- Enrollments policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admin can view all enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admin can manage enrollments" ON enrollments;

-- Tasks policies
DROP POLICY IF EXISTS "Students can view enrolled tasks" ON tasks;
DROP POLICY IF EXISTS "Admin can manage tasks" ON tasks;

-- Task submissions policies
DROP POLICY IF EXISTS "Students can view own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admin can view all submissions" ON task_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admin can update submissions" ON task_submissions;
DROP POLICY IF EXISTS "Students can update own submissions" ON task_submissions;

-- Badges policies
DROP POLICY IF EXISTS "Everyone can view badges" ON badges;
DROP POLICY IF EXISTS "Admin can manage badges" ON badges;

-- User badges policies
DROP POLICY IF EXISTS "Students can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Admin can view all user badges" ON user_badges;
DROP POLICY IF EXISTS "Admin can manage user badges" ON user_badges;

-- Certificates policies
DROP POLICY IF EXISTS "Students can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Admin can view all certificates" ON certificates;
DROP POLICY IF EXISTS "Public can view all certificates" ON certificates;
DROP POLICY IF EXISTS "Public can view certificates by share code" ON certificates;
DROP POLICY IF EXISTS "Admin can manage certificates" ON certificates;

-- Support tickets policies (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
    DROP POLICY IF EXISTS "Students can view own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Admin can view all tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Students can create tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Admin can update tickets" ON support_tickets;
  END IF;
END $$;

-- Ticket messages policies (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ticket_messages') THEN
    DROP POLICY IF EXISTS "Students can view own ticket messages" ON ticket_messages;
    DROP POLICY IF EXISTS "Admin can view all ticket messages" ON ticket_messages;
    DROP POLICY IF EXISTS "Students can create messages" ON ticket_messages;
    DROP POLICY IF EXISTS "Admin can create messages" ON ticket_messages;
  END IF;
END $$;

-- ==========================================
-- Step 3: Create new policies using is_admin() function
-- ==========================================

-- PROFILES TABLE POLICIES
-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admin can update any profile
CREATE POLICY "Admin can update profiles"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- COURSES TABLE POLICIES
-- Everyone can view courses
CREATE POLICY "Everyone can view courses"
ON courses FOR SELECT
TO authenticated
USING (true);

-- Only admin can manage courses
CREATE POLICY "Admin can manage courses"
ON courses FOR ALL
TO authenticated
USING (is_admin());

-- WEEKS TABLE POLICIES
-- Everyone can view weeks
CREATE POLICY "Everyone can view weeks"
ON weeks FOR SELECT
TO authenticated
USING (true);

-- Only admin can manage weeks
CREATE POLICY "Admin can manage weeks"
ON weeks FOR ALL
TO authenticated
USING (is_admin());

-- VIDEOS TABLE POLICIES
-- Everyone can view videos
CREATE POLICY "Everyone can view videos"
ON videos FOR SELECT
TO authenticated
USING (true);

-- Only admin can manage videos
CREATE POLICY "Admin can manage videos"
ON videos FOR ALL
TO authenticated
USING (is_admin());

-- ENROLLMENTS TABLE POLICIES
-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can view all enrollments
CREATE POLICY "Admin can view all enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (is_admin());

-- Only admin can manage enrollments
CREATE POLICY "Admin can manage enrollments"
ON enrollments FOR ALL
TO authenticated
USING (is_admin());

-- TASKS TABLE POLICIES
-- Students can view tasks for their enrolled courses OR admins can view all
CREATE POLICY "Students can view enrolled tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  is_admin() OR
  course_id IN (
    SELECT course_id FROM enrollments WHERE user_id = auth.uid()
  )
);

-- Admin can manage tasks
CREATE POLICY "Admin can manage tasks"
ON tasks FOR ALL
TO authenticated
USING (is_admin());

-- TASK SUBMISSIONS TABLE POLICIES
-- Students can view their own submissions
CREATE POLICY "Students can view own submissions"
ON task_submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can view all submissions
CREATE POLICY "Admin can view all submissions"
ON task_submissions FOR SELECT
TO authenticated
USING (is_admin());

-- Students can insert their own submissions
CREATE POLICY "Students can create submissions"
ON task_submissions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admin can update submissions (for grading)
CREATE POLICY "Admin can update submissions"
ON task_submissions FOR UPDATE
TO authenticated
USING (is_admin());

-- Students can update their own submissions
CREATE POLICY "Students can update own submissions"
ON task_submissions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- BADGES TABLE POLICIES
-- Everyone can view badges
CREATE POLICY "Everyone can view badges"
ON badges FOR SELECT
TO authenticated
USING (true);

-- Only admin can manage badges
CREATE POLICY "Admin can manage badges"
ON badges FOR ALL
TO authenticated
USING (is_admin());

-- USER BADGES TABLE POLICIES
-- Students can view their own badges
CREATE POLICY "Students can view own badges"
ON user_badges FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can view all user badges
CREATE POLICY "Admin can view all user badges"
ON user_badges FOR SELECT
TO authenticated
USING (is_admin());

-- Only admin can manage user badges
CREATE POLICY "Admin can manage user badges"
ON user_badges FOR ALL
TO authenticated
USING (is_admin());

-- CERTIFICATES TABLE POLICIES
-- Students can view their own certificates
CREATE POLICY "Students can view own certificates"
ON certificates FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can view all certificates
CREATE POLICY "Admin can view all certificates"
ON certificates FOR SELECT
TO authenticated
USING (is_admin());

-- Allow public access to all certificates (for sharing)
CREATE POLICY "Public can view all certificates"
ON certificates FOR SELECT
TO anon, authenticated
USING (true);

-- Only admin can manage certificates
CREATE POLICY "Admin can manage certificates"
ON certificates FOR ALL
TO authenticated
USING (is_admin());

-- ==========================================
-- Step 4: Optional - Support Tickets Policies
-- ==========================================
-- Only create if tables exist

DO $$
BEGIN
  -- Only create support tickets policies if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
    -- Students can view their own tickets
    CREATE POLICY "Students can view own tickets"
    ON support_tickets FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

    -- Admin can view all tickets
    CREATE POLICY "Admin can view all tickets"
    ON support_tickets FOR SELECT
    TO authenticated
    USING (is_admin());

    -- Students can create tickets
    CREATE POLICY "Students can create tickets"
    ON support_tickets FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

    -- Admin can update tickets
    CREATE POLICY "Admin can update tickets"
    ON support_tickets FOR UPDATE
    TO authenticated
    USING (is_admin());
    
    -- Only create ticket_messages policies if BOTH tables exist
    -- (ticket_messages policies reference support_tickets)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ticket_messages') THEN
      -- Students can view messages for their own tickets
      CREATE POLICY "Students can view own ticket messages"
      ON ticket_messages FOR SELECT
      TO authenticated
      USING (
        ticket_id IN (
          SELECT id FROM support_tickets WHERE user_id = auth.uid()
        )
      );

      -- Admin can view all ticket messages
      CREATE POLICY "Admin can view all ticket messages"
      ON ticket_messages FOR SELECT
      TO authenticated
      USING (is_admin());

      -- Students can create messages for their own tickets
      CREATE POLICY "Students can create messages"
      ON ticket_messages FOR INSERT
      TO authenticated
      WITH CHECK (
        ticket_id IN (
          SELECT id FROM support_tickets WHERE user_id = auth.uid()
        )
      );

      -- Admin can create messages for any ticket
      CREATE POLICY "Admin can create messages"
      ON ticket_messages FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
    END IF;
  END IF;
END $$;

-- ==========================================
-- Step 5: Verify the fix
-- ==========================================

-- Test the is_admin() function
SELECT 
  'Testing is_admin() function:' as info,
  auth.uid() as current_user_id,
  is_admin() as is_admin_user,
  (SELECT role FROM profiles WHERE id = auth.uid()) as user_role;

-- Show all policies for each table
SELECT 
  'All RLS Policies:' as info;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- ✅ COMPLETE! Run this script in Supabase SQL Editor
-- ==========================================
-- This fixes the infinite recursion error and allows:
-- • Admins to view/manage ALL data (dashboard, submissions, everything)
-- • Students to view only their own data
-- • No more "infinite recursion detected in policy" errors
--
-- After running this script:
-- 1. Refresh your admin dashboard
-- 2. Check that all data is visible
-- 3. Verify task submissions from students are showing
-- ==========================================
