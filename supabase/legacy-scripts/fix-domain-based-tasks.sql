-- ============================================
-- COMPLETE FIX: Domain-Based Task System
-- ============================================
-- This script fixes all issues related to:
-- 1. Domain filtering for tasks
-- 2. Student task viewing and submissions
-- 3. Admin task creation with domain support
-- Date: 2026-02-11

-- ============================================
-- STEP 1: Add domain column to tasks table
-- ============================================
ALTER TABLE IF EXISTS public.tasks
  ADD COLUMN IF NOT EXISTS domain VARCHAR(128);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_domain ON public.tasks(domain);
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON public.tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- ============================================
-- STEP 2: Update existing tasks with domain from courses
-- ============================================
UPDATE tasks t
SET domain = c.domain
FROM courses c
WHERE t.course_id = c.id
  AND t.domain IS NULL
  AND c.domain IS NOT NULL;

-- ============================================
-- STEP 3: Add indexes for enrolled_course_ids (if migration was run)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_enrolled_course_ids ON users USING GIN(enrolled_course_ids);
CREATE INDEX IF NOT EXISTS idx_users_domain ON public.users(domain);

-- ============================================
-- STEP 4: Ensure task_submissions table has proper indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_submitted_at ON task_submissions(submitted_at DESC);

-- ============================================
-- STEP 5: Ensure enrollments table has proper indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- ============================================
-- STEP 6: Create helper function to get student tasks
-- ============================================
CREATE OR REPLACE FUNCTION get_student_tasks(
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL,
  p_status VARCHAR DEFAULT 'active'
)
RETURNS TABLE (
  task_id UUID,
  task_title VARCHAR,
  task_description TEXT,
  task_deadline TIMESTAMP,
  task_max_points INTEGER,
  course_title VARCHAR,
  course_domain VARCHAR,
  submission_id UUID,
  submission_status VARCHAR,
  submission_points INTEGER,
  submission_submitted_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as task_id,
    t.title as task_title,
    t.description as task_description,
    t.deadline as task_deadline,
    t.max_points as task_max_points,
    c.title as course_title,
    c.domain as course_domain,
    ts.id as submission_id,
    ts.status as submission_status,
    ts.points_awarded as submission_points,
    ts.submitted_at as submission_submitted_at
  FROM tasks t
  INNER JOIN courses c ON t.course_id = c.id
  INNER JOIN enrollments e ON e.course_id = c.id AND e.user_id = p_user_id
  LEFT JOIN task_submissions ts ON ts.task_id = t.id AND ts.user_id = p_user_id
  WHERE t.status = p_status
    AND (p_course_id IS NULL OR t.course_id = p_course_id)
  ORDER BY t.deadline ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tasks with domains
SELECT 
  t.id, 
  t.title, 
  t.domain,
  c.title as course_title,
  c.domain as course_domain,
  CASE 
    WHEN t.domain IS NULL THEN '⚠️ Missing domain'
    WHEN t.domain = c.domain THEN '✅ Domain matches'
    ELSE '❌ Domain mismatch'
  END as domain_status
FROM tasks t
LEFT JOIN courses c ON t.course_id = c.id
ORDER BY t.created_at DESC
LIMIT 10;

-- Check users with domains and enrolled courses
SELECT 
  id,
  email,
  full_name,
  domain,
  role,
  enrolled_course_ids,
  array_length(enrolled_course_ids, 1) as total_enrolled_courses
FROM users
WHERE role = 'student'
LIMIT 10;

-- Check task submissions
SELECT 
  ts.id,
  u.full_name as student_name,
  t.title as task_title,
  ts.status,
  ts.points_awarded,
  ts.submitted_at
FROM task_submissions ts
JOIN users u ON ts.user_id = u.id
JOIN tasks t ON ts.task_id = t.id
ORDER BY ts.submitted_at DESC
LIMIT 10;

-- Summary statistics
SELECT 
  'Total Tasks' as metric,
  COUNT(*) as count
FROM tasks
UNION ALL
SELECT 
  'Tasks with Domain',
  COUNT(*) 
FROM tasks 
WHERE domain IS NOT NULL
UNION ALL
SELECT 
  'Total Submissions',
  COUNT(*) 
FROM task_submissions
UNION ALL
SELECT 
  'Students with Domain',
  COUNT(*) 
FROM users 
WHERE role = 'student' AND domain IS NOT NULL;

RAISE NOTICE '✅ Domain-based task system setup complete!';
