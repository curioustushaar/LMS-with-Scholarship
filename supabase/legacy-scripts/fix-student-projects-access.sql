-- Fix Student Access to Projects
-- Run this in Supabase SQL Editor to ensure students can see their assigned projects

-- 1. Ensure projects table has correct structure
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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_course_id ON projects(course_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 3. Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (if any)
DROP POLICY IF EXISTS "Students can view their own projects" ON projects;
DROP POLICY IF EXISTS "Students can update their own projects" ON projects;
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP POLICY IF EXISTS "Service role full access to projects" ON projects;

-- 5. Create policy for students to view their own projects
CREATE POLICY "Students can view their own projects"
ON projects FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 6. Create policy for students to update their own projects (for submissions)
CREATE POLICY "Students can update their own projects"
ON projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Create policy for admins to manage all projects
CREATE POLICY "Admin full access to projects"
ON projects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 8. Create policy for service role (backend operations)
CREATE POLICY "Service role full access to projects"
ON projects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 9. Verify the setup
SELECT 
  'Table exists' as check_type,
  COUNT(*) as count 
FROM information_schema.tables 
WHERE table_name = 'projects';

SELECT 
  'Policies created' as check_type,
  COUNT(*) as count 
FROM pg_policies 
WHERE tablename = 'projects';

-- 10. Check sample projects with student and course details
SELECT 
  p.id,
  p.title as project_title,
  u.email as student_email,
  u.full_name as student_name,
  c.title as course_title,
  p.status,
  p.deadline,
  p.created_at
FROM projects p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN courses c ON p.course_id = c.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 11. Check specific student's projects (replace email with actual student email)
SELECT 
  p.id,
  p.title as project_title,
  p.description,
  c.title as course_title,
  p.status,
  p.deadline,
  p.project_url,
  p.created_at
FROM projects p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN courses c ON p.course_id = c.id
WHERE u.email = 'roybabu1452@gmail.com'
ORDER BY p.created_at DESC;

-- Success message
SELECT '✅ Student project access has been configured!' as status;
