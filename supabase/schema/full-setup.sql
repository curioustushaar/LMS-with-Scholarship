-- ====================================================================
-- LMS ADMIN & STUDENT PORTAL - COMPLETE DATABASE SCHEMA SETUP
-- ====================================================================
-- Run this script in your Supabase SQL Editor to set up a brand new
-- database with all tables, triggers, indexes, and RLS policies.
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. PROFILES TABLE (Syncs with auth.users)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('superadmin', 'admin', 'student')),
  account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
  profile_image_url TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 2. COURSES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_weeks INTEGER,
  level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  domain VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. WEEKS TABLE (Course Content Organization)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  locked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, week_number)
);

-- ====================================================================
-- 4. VIDEOS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 5. VIDEO_PROGRESS TABLE (Track student video progress)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  watched_duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- ====================================================================
-- 6. TASKS TABLE (Assignments / Quizzes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  week_id UUID REFERENCES public.weeks(id) ON DELETE SET NULL, -- Nullable as per MIGRATION_REQUIRED
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  max_points INTEGER DEFAULT 100,
  task_type VARCHAR(50) DEFAULT 'assignment' CHECK (task_type IN ('assignment', 'quiz', 'project', 'discussion', 'submission')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  domain VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 7. TASK_SUBMISSIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_url TEXT,
  submission_text TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed', 'approved', 'rejected', 'evaluated')),
  points_awarded INTEGER DEFAULT 0,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- ====================================================================
-- 8. PROJECTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_url TEXT,
  github_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  feedback TEXT,
  score INTEGER,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 8a. PROJECT_MILESTONES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 8b. PROJECT_DELIVERABLES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 9. BADGES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria TEXT,
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 10. USER_BADGES TABLE (Junction Table)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(user_id, badge_id)
);

-- ====================================================================
-- 11. CERTIFICATES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_url TEXT,
  status VARCHAR(50) DEFAULT 'issued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 12. TICKETS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 12a. TICKET_MESSAGES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 13. ENROLLMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ====================================================================
-- 13a. ADMIN_COURSE_ASSIGNMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.admin_course_assignments (
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (admin_id, course_id)
);

-- ====================================================================
-- 14. SETTINGS TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  new_student_registration BOOLEAN DEFAULT TRUE,
  new_task_submission BOOLEAN DEFAULT TRUE,
  project_pending_approval BOOLEAN DEFAULT TRUE,
  new_support_ticket BOOLEAN DEFAULT TRUE,
  certificate_approval_request BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_courses_domain ON public.courses(domain);
CREATE INDEX IF NOT EXISTS idx_weeks_course ON public.weeks(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_week ON public.videos(week_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user ON public.video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON public.video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON public.tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_domain ON public.tasks(domain);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON public.task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON public.task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_course_id ON public.projects(course_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_milestone ON public.project_deliverables(milestone_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_admin_course_assignments_admin_id ON public.admin_course_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_course_assignments_course_id ON public.admin_course_assignments(course_id);

-- ====================================================================
-- TRIGGERS & FUNCTIONS FOR AUTH SYNC
-- ====================================================================

-- Function to handle new user signups - sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, account_status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) CONFIGURED
-- ====================================================================

-- Function to safely check if user is admin or superadmin (prevents infinite recursion in RLS policies)
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_course_assignments ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 2. Courses Table Policies
CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage courses" ON public.courses FOR ALL TO authenticated
  USING (is_admin());

-- 3. Weeks Table Policies
CREATE POLICY "Everyone can view weeks" ON public.weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage weeks" ON public.weeks FOR ALL TO authenticated
  USING (is_admin());

-- 4. Videos Table Policies
CREATE POLICY "Everyone can view videos" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage videos" ON public.videos FOR ALL TO authenticated
  USING (is_admin());

-- 5. Enrollments Table Policies
CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admin can view all enrollments" ON public.enrollments FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "Admin can manage enrollments" ON public.enrollments FOR ALL TO authenticated
  USING (is_admin());

-- 6. Tasks Table Policies
CREATE POLICY "Students can view enrolled tasks" ON public.tasks FOR SELECT TO authenticated
  USING (course_id IN (SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()) OR is_admin());
CREATE POLICY "Admin can manage tasks" ON public.tasks FOR ALL TO authenticated
  USING (is_admin());

-- 7. Task Submissions Table Policies
CREATE POLICY "Students can view own submissions" ON public.task_submissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view all submissions" ON public.task_submissions FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "Students can create submissions" ON public.task_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin can update submissions" ON public.task_submissions FOR UPDATE TO authenticated
  USING (is_admin());

-- 8. Support Tickets (tickets) Table Policies
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view all tickets" ON public.tickets FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin can update tickets" ON public.tickets FOR UPDATE TO authenticated
  USING (is_admin());

-- 9. Ticket Messages Table Policies
CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages FOR SELECT TO authenticated
  USING (ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid()));
CREATE POLICY "Admin can view all ticket messages" ON public.ticket_messages FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "Users can create ticket messages" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid()));
CREATE POLICY "Admin can create ticket messages" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- 10. Badges Table Policies
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage badges" ON public.badges FOR ALL TO authenticated
  USING (is_admin());

-- 11. User Badges Table Policies
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view all user badges" ON public.user_badges FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "Admin can manage user badges" ON public.user_badges FOR ALL TO authenticated
  USING (is_admin());

-- 12. Certificates Table Policies (Public access allowed for viewing/verification)
CREATE POLICY "Anyone can view certificates" ON public.certificates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can create certificates" ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- 13. Admin Course Assignments Table Policies
CREATE POLICY "Admins and superadmins can view course assignments" ON public.admin_course_assignments FOR SELECT TO authenticated
  USING (is_admin() OR admin_id = auth.uid());
CREATE POLICY "Superadmins can manage course assignments" ON public.admin_course_assignments FOR ALL TO authenticated
  USING (is_admin());

-- ====================================================================
-- SEED DATA (System settings & Email templates)
-- ====================================================================
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
  ('platform_name', 'LMS platform', 'Name of the learning management platform'),
  ('support_email', 'support@lms.com', 'Support contact email'),
  ('default_course_duration', '12', 'Default course duration in weeks'),
  ('certificate_pass_percentage', '80', 'Minimum percentage required for certificate')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.email_templates (template_name, subject, body, description) VALUES
  ('welcome_email', 'Welcome to {{platform_name}}!', 
   'Hello {{student_name}},\n\nWelcome to {{platform_name}}! We are excited to have you join our learning community.\n\nYou can now access all courses and start your learning journey.\n\nBest regards,\nThe {{platform_name}} Team',
   'Sent when a new student registers'),
  ('password_reset', 'Password Reset Request',
   'Hello {{user_name}},\n\nWe received a request to reset your password. Click the link below to reset it:\n\n{{reset_link}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe {{platform_name}} Team',
   'Sent when password reset is requested'),
  ('certificate_issued', 'Congratulations! Your Certificate is Ready',
   'Hello {{student_name}},\n\nCongratulations! Your certificate for {{course_name}} has been approved and is now ready.\n\nYou can download it here: {{certificate_link}}\n\nWell done on completing the course!\n\nBest regards,\nThe {{platform_name}} Team',
   'Sent when certificate is approved')
ON CONFLICT (template_name) DO NOTHING;

-- ====================================================================
-- SCHOLARSHIP REFERENCE CODES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.scholarship_reference_codes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarship_ref_code ON public.scholarship_reference_codes(code);
CREATE INDEX IF NOT EXISTS idx_scholarship_ref_phone ON public.scholarship_reference_codes(phone);
CREATE INDEX IF NOT EXISTS idx_scholarship_ref_email ON public.scholarship_reference_codes(email);

ALTER TABLE public.scholarship_reference_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active reference codes" ON public.scholarship_reference_codes;
DROP POLICY IF EXISTS "Full access to reference codes for service role" ON public.scholarship_reference_codes;
CREATE POLICY "Public read active reference codes" ON public.scholarship_reference_codes FOR SELECT USING (true);
CREATE POLICY "Full access to reference codes for service role" ON public.scholarship_reference_codes FOR ALL USING (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

