-- ==========================================
-- DEBUG: Check Student Submissions Data 
-- ==========================================
-- Run this in Supabase SQL Editor to debug missing submissions

-- 1. Check if task_submissions table exists and has columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'task_submissions' 
ORDER BY ordinal_position;

-- 2. Check if projects table exists (maybe submission went there instead)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- 3. Check for any submissions by roybabu1452@gmail.com in task_submissions
SELECT 
  ts.*,
  u.email,
  u.full_name,
  t.title as task_title
FROM task_submissions ts
LEFT JOIN users u ON u.id = ts.user_id  
LEFT JOIN tasks t ON t.id = ts.task_id
WHERE u.email = 'roybabu1452@gmail.com'
ORDER BY ts.submitted_at DESC;

-- 4. Check for any project submissions by roybabu1452@gmail.com
SELECT 
  p.*,
  u.email,
  u.full_name
FROM projects p
LEFT JOIN users u ON u.id = p.user_id
WHERE u.email = 'roybabu1452@gmail.com'
AND p.status = 'submitted'
ORDER BY p.updated_at DESC;

-- 5. Check ALL task_submissions (maybe RLS blocking admin view)
SELECT 
  COUNT(*) as total_task_submissions,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
FROM task_submissions;

-- 6. Check ALL project submissions
SELECT 
  COUNT(*) as total_projects,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_projects,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_projects
FROM projects;

-- 7. Check user ID for roybabu1452@gmail.com
SELECT id, email, full_name, role, status 
FROM users 
WHERE email = 'roybabu1452@gmail.com';

-- 8. Check all available tasks
SELECT id, title, status, course_id, created_at
FROM tasks 
WHERE status = 'active'
ORDER BY created_at DESC;