-- ==========================================
-- LMS ADMIN - SUPABASE DATABASE SCHEMA
-- ==========================================
-- Run this SQL in your Supabase SQL Editor
-- This creates all necessary tables for LMS Admin & Student apps

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  phone VARCHAR(20),
  enrollment_date TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 2. COURSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_weeks INTEGER,
  level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 3. WEEKS TABLE (Course Content Organization)
-- ==========================================
CREATE TABLE IF NOT EXISTS weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  locked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, week_number)
);

-- ==========================================
-- 4. VIDEOS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 5. VIDEO_PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  watched_duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- ==========================================
-- 6. TASKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMP,
  week_id UUID REFERENCES weeks(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  max_points INTEGER DEFAULT 100,
  task_type VARCHAR(50) DEFAULT 'assignment' CHECK (task_type IN ('assignment', 'quiz', 'project', 'discussion', 'submission')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 7. TASK_SUBMISSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_url TEXT,
  submission_text TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed', 'approved', 'rejected')),
  points_awarded INTEGER DEFAULT 0,
  feedback TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- ==========================================
-- 8. PROJECTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_url TEXT,
  github_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  feedback TEXT,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 8a. PROJECT_MILESTONES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMP,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 8b. PROJECT_DELIVERABLES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 9. BADGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria TEXT,
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 10. USER_BADGES TABLE (Junction Table)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP DEFAULT NOW(),
  awarded_by UUID REFERENCES users(id),
  UNIQUE(user_id, badge_id)
);

-- ==========================================
-- 11. CERTIFICATES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 12. SUPPORT_TICKETS TABLE (renamed to tickets for consistency)
-- ==========================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- ==========================================
-- 12a. TICKET_MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- SCHEMA MIGRATIONS (Add missing columns if tables already exist)
-- ==========================================

-- USERS TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'enrollment_date') THEN
    ALTER TABLE users ADD COLUMN enrollment_date TIMESTAMP DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_active') THEN
    ALTER TABLE users ADD COLUMN last_active TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
    ALTER TABLE users ADD COLUMN profile_image_url TEXT;
  END IF;
END $$;

-- COURSES TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration_weeks') THEN
    ALTER TABLE courses ADD COLUMN duration_weeks INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'level') THEN
    ALTER TABLE courses ADD COLUMN level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
    ALTER TABLE courses ADD COLUMN status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'created_by') THEN
    ALTER TABLE courses ADD COLUMN created_by UUID REFERENCES users(id);
  END IF;
END $$;

-- VIDEOS TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'duration_minutes') THEN
    ALTER TABLE videos ADD COLUMN duration_minutes INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'order_index') THEN
    ALTER TABLE videos ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;

-- VIDEO_PROGRESS TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'watched_duration') THEN
    ALTER TABLE video_progress ADD COLUMN watched_duration INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'last_watched_at') THEN
    ALTER TABLE video_progress ADD COLUMN last_watched_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

-- TASKS TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'course_id') THEN
    ALTER TABLE tasks ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'deadline') THEN
    ALTER TABLE tasks ADD COLUMN deadline TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'max_points') THEN
    ALTER TABLE tasks ADD COLUMN max_points INTEGER DEFAULT 100;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'task_type') THEN
    ALTER TABLE tasks ADD COLUMN task_type VARCHAR(50) DEFAULT 'assignment' CHECK (task_type IN ('assignment', 'quiz', 'project', 'discussion', 'submission'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
    ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by') THEN
    ALTER TABLE tasks ADD COLUMN created_by UUID REFERENCES users(id);
  END IF;
END $$;

-- TASK_SUBMISSIONS TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'submission_url') THEN
    ALTER TABLE task_submissions ADD COLUMN submission_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'submission_text') THEN
    ALTER TABLE task_submissions ADD COLUMN submission_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'points_awarded') THEN
    ALTER TABLE task_submissions ADD COLUMN points_awarded INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'feedback') THEN
    ALTER TABLE task_submissions ADD COLUMN feedback TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'reviewed_at') THEN
    ALTER TABLE task_submissions ADD COLUMN reviewed_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'reviewed_by') THEN
    ALTER TABLE task_submissions ADD COLUMN reviewed_by UUID REFERENCES users(id);
  END IF;
END $$;

-- PROJECTS TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_url') THEN
    ALTER TABLE projects ADD COLUMN project_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'github_url') THEN
    ALTER TABLE projects ADD COLUMN github_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE projects ADD COLUMN thumbnail_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'submitted_at') THEN
    ALTER TABLE projects ADD COLUMN submitted_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'reviewed_at') THEN
    ALTER TABLE projects ADD COLUMN reviewed_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'reviewed_by') THEN
    ALTER TABLE projects ADD COLUMN reviewed_by UUID REFERENCES users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'feedback') THEN
    ALTER TABLE projects ADD COLUMN feedback TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'score') THEN
    ALTER TABLE projects ADD COLUMN score INTEGER;
  END IF;
END $$;

-- PROJECT_MILESTONES TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_milestones' AND column_name = 'due_date') THEN
    ALTER TABLE project_milestones ADD COLUMN due_date TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_milestones' AND column_name = 'completed_at') THEN
    ALTER TABLE project_milestones ADD COLUMN completed_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_milestones' AND column_name = 'order_index') THEN
    ALTER TABLE project_milestones ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;

-- PROJECT_DELIVERABLES TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_deliverables' AND column_name = 'file_url') THEN
    ALTER TABLE project_deliverables ADD COLUMN file_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_deliverables' AND column_name = 'submitted_at') THEN
    ALTER TABLE project_deliverables ADD COLUMN submitted_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_deliverables' AND column_name = 'feedback') THEN
    ALTER TABLE project_deliverables ADD COLUMN feedback TEXT;
  END IF;
END $$;

-- BADGES TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'icon_url') THEN
    ALTER TABLE badges ADD COLUMN icon_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'criteria') THEN
    ALTER TABLE badges ADD COLUMN criteria TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'points_required') THEN
    ALTER TABLE badges ADD COLUMN points_required INTEGER DEFAULT 0;
  END IF;
END $$;

-- USER_BADGES TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'awarded_by') THEN
    ALTER TABLE user_badges ADD COLUMN awarded_by UUID REFERENCES users(id);
  END IF;
END $$;

-- CERTIFICATES TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'certificate_url') THEN
    ALTER TABLE certificates ADD COLUMN certificate_url TEXT;
  END IF;
END $$;

-- TICKETS TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'category') THEN
    ALTER TABLE tickets ADD COLUMN category VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'priority') THEN
    ALTER TABLE tickets ADD COLUMN priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'assigned_to') THEN
    ALTER TABLE tickets ADD COLUMN assigned_to UUID REFERENCES users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'resolved_at') THEN
    ALTER TABLE tickets ADD COLUMN resolved_at TIMESTAMP;
  END IF;
END $$;

-- TICKET_MESSAGES TABLE migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_messages' AND column_name = 'is_admin') THEN
    ALTER TABLE ticket_messages ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_messages' AND column_name = 'attachment_url') THEN
    ALTER TABLE ticket_messages ADD COLUMN attachment_url TEXT;
  END IF;
END $$;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_milestone ON project_deliverables(milestone_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_weeks_course ON weeks(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_week ON videos(week_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- ==========================================
-- Enable RLS on tables (uncomment if needed)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FUNCTIONS FOR SUPABASE AUTH INTEGRATION
-- ==========================================

-- Function to handle new user signups - sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, status, created_at, updated_at)
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

-- Trigger to automatically create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_active = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- SAMPLE ADMIN USER (CHANGE PASSWORD!)
-- ==========================================
-- Note: For Supabase Auth, create admin via Supabase Dashboard
-- This is just for fallback/testing
INSERT INTO users (email, full_name, role, status) 
VALUES ('admin@lms.com', 'Admin User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- SCHOLARSHIP REFERENCE CODES TABLE
-- ==========================================
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

-- ==========================================
-- DONE! Your database is ready.
-- ==========================================

