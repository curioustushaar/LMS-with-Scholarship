-- Quick Test Script for Domain-Based Task System
-- Run these queries to test the system
-- Date: 2026-02-11

-- ============================================
-- TEST 1: Check if domain columns exist
-- ============================================
SELECT 
  'Tasks domain column exists' as test_result,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'domain'
  ) as passed;

SELECT 
  'Users domain column exists' as test_result,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'domain'
  ) as passed;

SELECT 
  'Courses domain column exists' as test_result,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'domain'
  ) as passed;

-- ============================================
-- TEST 2: Check indexes
-- ============================================
SELECT 
  'Tasks domain index exists' as test_result,
  EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'tasks' AND indexname = 'idx_tasks_domain'
  ) as passed;

-- ============================================
-- TEST 3: Sample data check
-- ============================================

-- Show courses with domains
SELECT 
  'Courses with domains' as test,
  COUNT(*) as total_courses,
  COUNT(domain) as courses_with_domain,
  ROUND(COUNT(domain)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as percentage
FROM courses;

-- Show tasks with domains
SELECT 
  'Tasks with domains' as test,
  COUNT(*) as total_tasks,
  COUNT(domain) as tasks_with_domain,
  ROUND(COUNT(domain)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as percentage
FROM tasks;

-- Show students with domains
SELECT 
  'Students with domains' as test,
  COUNT(*) as total_students,
  COUNT(domain) as students_with_domain,
  ROUND(COUNT(domain)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as percentage
FROM users
WHERE role = 'student';

-- ============================================
-- TEST 4: Check enrollments
-- ============================================

-- Do we have enrollments?
SELECT 
  COUNT(*) as total_enrollments,
  COUNT(DISTINCT user_id) as unique_students,
  COUNT(DISTINCT course_id) as unique_courses
FROM enrollments;

-- ============================================
-- TEST 5: Check task submissions
-- ============================================
SELECT 
  COUNT(*) as total_submissions,
  COUNT(DISTINCT user_id) as unique_students,
  COUNT(DISTINCT task_id) as unique_tasks,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
  COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed
FROM task_submissions;

-- ============================================
-- TEST 6: Domain consistency check
-- ============================================

-- Check if task domains match their course domains
SELECT 
  'Task-Course domain mismatch' as test,
  COUNT(*) as total_mismatches
FROM tasks t
JOIN courses c ON t.course_id = c.id
WHERE t.domain IS NOT NULL 
  AND c.domain IS NOT NULL 
  AND t.domain != c.domain;

-- ============================================
-- TEST 7: Sample query - Get tasks for a domain
-- ============================================
SELECT 
  t.id,
  t.title,
  t.domain as task_domain,
  c.title as course_title,
  c.domain as course_domain,
  t.deadline,
  t.status
FROM tasks t
JOIN courses c ON t.course_id = c.id
WHERE t.domain IS NOT NULL
ORDER BY t.created_at DESC
LIMIT 5;

-- ============================================
-- TEST 8: Sample query - Get student tasks
-- ============================================

-- Replace 'STUDENT_ID_HERE' with actual student UUID
-- SELECT * FROM get_student_tasks('STUDENT_ID_HERE'::uuid);

-- ============================================
-- TEST 9: Create sample domain data (if needed)
-- ============================================

-- Uncomment to create sample domains
/*
-- Set domain for existing courses
UPDATE courses 
SET domain = 'Web Development' 
WHERE title ILIKE '%web%' OR title ILIKE '%frontend%' OR title ILIKE '%react%'
  AND domain IS NULL;

UPDATE courses 
SET domain = 'Data Science' 
WHERE title ILIKE '%data%' OR title ILIKE '%python%' OR title ILIKE '%ml%'
  AND domain IS NULL;

UPDATE courses 
SET domain = 'Mobile Development' 
WHERE title ILIKE '%mobile%' OR title ILIKE '%android%' OR title ILIKE '%ios%'
  AND domain IS NULL;

-- Update tasks to match course domains
UPDATE tasks t
SET domain = c.domain
FROM courses c
WHERE t.course_id = c.id
  AND c.domain IS NOT NULL;

-- Set domain for students (example)
UPDATE users
SET domain = 'Web Development'
WHERE role = 'student' AND domain IS NULL
LIMIT 10;
*/

-- ============================================
-- FINAL SUMMARY
-- ============================================
SELECT 
  '=== SYSTEM HEALTH CHECK ===' as summary,
  '' as details
UNION ALL
SELECT 
  'Total Courses',
  COUNT(*)::text || ' (' || COUNT(domain)::text || ' with domain)'
FROM courses
UNION ALL
SELECT 
  'Total Tasks',
  COUNT(*)::text || ' (' || COUNT(domain)::text || ' with domain)'
FROM tasks
UNION ALL
SELECT 
  'Total Students',
  COUNT(*)::text || ' (' || COUNT(domain)::text || ' with domain)'
FROM users WHERE role = 'student'
UNION ALL
SELECT 
  'Total Enrollments',
  COUNT(*)::text
FROM enrollments
UNION ALL
SELECT 
  'Total Submissions',
  COUNT(*)::text
FROM task_submissions;
