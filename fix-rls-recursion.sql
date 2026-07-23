-- Fix infinite recursion in RLS policies
-- The issue is that admin policies are checking users table which creates circular dependency
-- Date: 2026-02-11

-- ==========================================
-- DISABLE RLS TEMPORARILY TO FIX POLICIES
-- ==========================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY; 
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$ 
BEGIN
    -- Drop all policies for users table
    DROP POLICY IF EXISTS "Admin full access to users" ON users;
    DROP POLICY IF EXISTS "Students can view their own profile" ON users;
    DROP POLICY IF EXISTS "Students can update their own profile" ON users;
    
    -- Drop all policies for other tables
    DROP POLICY IF EXISTS "Admin full access to courses" ON courses;
    DROP POLICY IF EXISTS "Students can view active courses" ON courses;
    DROP POLICY IF EXISTS "Admin full access to enrollments" ON enrollments;
    DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
    DROP POLICY IF EXISTS "Admin full access to weeks" ON weeks;
    DROP POLICY IF EXISTS "Students can view weeks of enrolled courses" ON weeks;
    DROP POLICY IF EXISTS "Admin full access to videos" ON videos;
    DROP POLICY IF EXISTS "Students can view videos of enrolled courses" ON videos;
    DROP POLICY IF EXISTS "Admin full access to video_progress" ON video_progress;
    DROP POLICY IF EXISTS "Students manage their own video progress" ON video_progress;
    DROP POLICY IF EXISTS "Admin full access to tasks" ON tasks;
    DROP POLICY IF EXISTS "Students can view tasks of enrolled courses" ON tasks;
END $$;

-- ==========================================
-- CREATE SIMPLIFIED NON-RECURSIVE POLICIES
-- ==========================================

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- USERS TABLE - Simple approach: users can only see/edit themselves, no admin check recursion
CREATE POLICY "Users can manage their own data" ON users
FOR ALL USING (auth.uid() = id);

-- COURSES TABLE - Allow all authenticated users to read, no recursion
CREATE POLICY "Authenticated users can view courses" ON courses
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage courses" ON courses
FOR ALL USING (auth.role() = 'service_role');

-- ENROLLMENTS TABLE - Users see their own enrollments
CREATE POLICY "Users can view their own enrollments" ON enrollments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage enrollments" ON enrollments
FOR ALL USING (auth.role() = 'service_role');

-- WEEKS TABLE - All authenticated can view
CREATE POLICY "Authenticated users can view weeks" ON weeks
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage weeks" ON weeks
FOR ALL USING (auth.role() = 'service_role');

-- VIDEOS TABLE - All authenticated can view
CREATE POLICY "Authenticated users can view videos" ON videos
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage videos" ON videos
FOR ALL USING (auth.role() = 'service_role');

-- VIDEO_PROGRESS TABLE - Users manage their own progress
CREATE POLICY "Users manage their own video progress" ON video_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage video progress" ON video_progress
FOR ALL USING (auth.role() = 'service_role');

-- TASKS TABLE - All authenticated can view
CREATE POLICY "Authenticated users can view tasks" ON tasks
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage tasks" ON tasks
FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==========================================
-- CREATE OR UPDATE ADMIN USER
-- ==========================================

-- Update existing admin user or the current user to admin role
UPDATE users 
SET role = 'admin', status = 'active'
WHERE id = 'dc420dee-0beb-49b1-adc9-66e2b830fdb0';

-- If above doesn't work, insert admin user record
INSERT INTO users (id, email, full_name, role, status) 
VALUES ('dc420dee-0beb-49b1-adc9-66e2b830fdb0', 'admin@gmail.com', 'Admin User', 'admin', 'active')
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin', 
  status = 'active',
  updated_at = NOW();

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check if admin user exists and has correct role
SELECT id, email, full_name, role, status 
FROM users 
WHERE id = 'dc420dee-0beb-49b1-adc9-66e2b830fdb0';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;