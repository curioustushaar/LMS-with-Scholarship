-- Run ALL Student Access Fixes Together
-- Execute this complete SQL file in Supabase SQL Editor

-- ==========================================
-- PART 1: FIX ENROLLMENTS ACCESS
-- ==========================================

-- 1. Ensure enrollments table exists with correct structure
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 2. Create indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- 3. Enable RLS on enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate enrollments policies
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admin full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Service role full access to enrollments" ON enrollments;

CREATE POLICY "Students can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR 
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admin full access to enrollments"
ON enrollments FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Service role full access to enrollments"
ON enrollments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==========================================
-- PART 2: FIX PROJECTS ACCESS
-- ==========================================

-- 1. Ensure projects table exists
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_url TEXT,
  github_url TEXT,
  thumbnail_url TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  feedback TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_course_id ON projects(course_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 3. Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate projects policies
DROP POLICY IF EXISTS "Students can view their own projects" ON projects;
DROP POLICY IF EXISTS "Students can update their own projects" ON projects;
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP POLICY IF EXISTS "Service role full access to projects" ON projects;

CREATE POLICY "Students can view their own projects"
ON projects FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR 
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Students can update their own projects"
ON projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access to projects"
ON projects FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Service role full access to projects"
ON projects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==========================================
-- VERIFICATION & TESTING
-- ==========================================

-- Check enrollments for Ankit Kumar Gupta
SELECT 
  '📚 ENROLLMENTS CHECK' as section,
  e.id,
  u.email as student_email,
  c.title as course_title,
  e.enrolled_at
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE u.email = 'roybabu1452@gmail.com'
ORDER BY e.enrolled_at DESC;

-- Check projects for Ankit Kumar Gupta
SELECT 
  '📁 PROJECTS CHECK' as section,
  p.id,
  p.title as project_title,
  p.description,
  u.email as student_email,
  c.title as course_title,
  p.status,
  p.deadline,
  p.created_at
FROM projects p
JOIN users u ON p.user_id = u.id
LEFT JOIN courses c ON p.course_id = c.id
WHERE u.email = 'roybabu1452@gmail.com'
ORDER BY p.created_at DESC;

-- Verify policies
SELECT 
  '🔒 RLS POLICIES' as section,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('enrollments', 'projects')
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ ALL STUDENT ACCESS POLICIES CONFIGURED SUCCESSFULLY!' as status;
SELECT '🎓 Students can now see their enrolled courses and assigned projects' as info;
