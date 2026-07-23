-- ====================================================================
-- 🔧 FIX INFINITE RECURSION IN RLS POLICIES
-- ====================================================================
-- Run this script in your Supabase SQL Editor to resolve:
-- "infinite recursion detected in policy for relation profiles"
-- ====================================================================

BEGIN;

-- 0. Ensure admin_course_assignments table exists with correct schema
CREATE TABLE IF NOT EXISTS public.admin_course_assignments (
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (admin_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_course_assignments_admin_id ON public.admin_course_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_course_assignments_course_id ON public.admin_course_assignments(course_id);

ALTER TABLE public.admin_course_assignments ENABLE ROW LEVEL SECURITY;

-- 0a. Ensure created_by_admin_id column exists on profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_created_by_admin 
ON public.profiles(created_by_admin_id);

-- 1. Create helper function to check admin status securely (runs bypassing RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Drop existing policies to prevent "already exists" errors
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins and superadmins can view course assignments" ON public.admin_course_assignments;
DROP POLICY IF EXISTS "Superadmins can manage course assignments" ON public.admin_course_assignments;

DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;

DROP POLICY IF EXISTS "Everyone can view weeks" ON public.weeks;
DROP POLICY IF EXISTS "Admin can manage weeks" ON public.weeks;

DROP POLICY IF EXISTS "Everyone can view videos" ON public.videos;
DROP POLICY IF EXISTS "Admin can manage videos" ON public.videos;

DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admin can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admin can manage enrollments" ON public.enrollments;

DROP POLICY IF EXISTS "Students can view enrolled tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin can manage tasks" ON public.tasks;

DROP POLICY IF EXISTS "Students can view own submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Admin can view all submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Admin can update submissions" ON public.task_submissions;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admin can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admin can update tickets" ON public.tickets;

DROP POLICY IF EXISTS "Users can view own ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admin can view all ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can create ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admin can create ticket messages" ON public.ticket_messages;

DROP POLICY IF EXISTS "Everyone can view badges" ON public.badges;
DROP POLICY IF EXISTS "Admin can manage badges" ON public.badges;

DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Admin can view all user badges" ON public.user_badges;
DROP POLICY IF EXISTS "Admin can manage user badges" ON public.user_badges;

DROP POLICY IF EXISTS "Anyone can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admin can create certificates" ON public.certificates;

-- 3. Recreate policies using the is_admin() function
-- Profiles
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Courses
CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage courses" ON public.courses FOR ALL TO authenticated USING (is_admin());

-- Weeks
CREATE POLICY "Everyone can view weeks" ON public.weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage weeks" ON public.weeks FOR ALL TO authenticated USING (is_admin());

-- Videos
CREATE POLICY "Everyone can view videos" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage videos" ON public.videos FOR ALL TO authenticated USING (is_admin());

-- Enrollments
CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view all enrollments" ON public.enrollments FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin can manage enrollments" ON public.enrollments FOR ALL TO authenticated USING (is_admin());

-- Tasks
CREATE POLICY "Students can view enrolled tasks" ON public.tasks FOR SELECT TO authenticated USING (course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR is_admin());
CREATE POLICY "Admin can manage tasks" ON public.tasks FOR ALL TO authenticated USING (is_admin());

-- Task Submissions
CREATE POLICY "Students can view own submissions" ON public.task_submissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view all submissions" ON public.task_submissions FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Students can create submissions" ON public.task_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin can update submissions" ON public.task_submissions FOR UPDATE TO authenticated USING (is_admin());

-- Tickets (Support tickets)
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view all tickets" ON public.tickets FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin can update tickets" ON public.tickets FOR UPDATE TO authenticated USING (is_admin());

-- Ticket Messages
CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages FOR SELECT TO authenticated USING (ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid()));
CREATE POLICY "Admin can view all ticket messages" ON public.ticket_messages FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Users can create ticket messages" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid()));
CREATE POLICY "Admin can create ticket messages" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (is_admin());

-- Badges
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage badges" ON public.badges FOR ALL TO authenticated USING (is_admin());

-- User Badges
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view all user badges" ON public.user_badges FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin can manage user badges" ON public.user_badges FOR ALL TO authenticated USING (is_admin());

-- Certificates
CREATE POLICY "Anyone can view certificates" ON public.certificates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can create certificates" ON public.certificates FOR INSERT TO authenticated WITH CHECK (is_admin());

-- Admin Course Assignments
CREATE POLICY "Admins and superadmins can view course assignments" ON public.admin_course_assignments FOR SELECT TO authenticated USING (is_admin() OR admin_id = auth.uid());
CREATE POLICY "Superadmins can manage course assignments" ON public.admin_course_assignments FOR ALL TO authenticated USING (is_admin());

COMMIT;

-- Reload schema
NOTIFY pgrst, 'reload schema';
