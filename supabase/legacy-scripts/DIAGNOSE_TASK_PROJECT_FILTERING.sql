-- ==========================================
-- FIX: TASKS & PROJECTS SHOWING TO WRONG STUDENTS
-- ==========================================
-- Problem: Students seeing tasks/projects from courses they're not enrolled in
-- Solution: Ensure all tasks/projects have course_id and proper filtering
-- Date: February 18, 2026

BEGIN;

-- ==========================================
-- 1. CHECK TASKS WITHOUT COURSE_ID (ORPHAN TASKS)
-- ==========================================

-- Find tasks that have no course assigned
SELECT 
  id,
  title,
  course_id,
  status,
  'TASK HAS NO COURSE - WILL SHOW TO ALL STUDENTS' as issue
FROM tasks
WHERE course_id IS NULL;

-- ==========================================
-- 2. CHECK PROJECTS WITHOUT COURSE_ID (ORPHAN PROJECTS)
-- ==========================================

-- Find projects that have no course assigned
SELECT 
  id,
  title,
  course_id,
  status,
  'PROJECT HAS NO COURSE - WILL SHOW TO ALL STUDENTS' as issue
FROM projects
WHERE course_id IS NULL;

-- ==========================================
-- 3. CHECK STUDENT ENROLLMENTS
-- ==========================================

-- See which students are enrolled in which courses
SELECT 
  p.email,
  p.full_name,
  c.title as course_title,
  e.enrolled_at
FROM enrollments e
JOIN profiles p ON e.user_id = p.id
JOIN courses c ON e.course_id = c.id
WHERE p.role = 'student'
ORDER BY p.email, c.title;

-- ==========================================
-- 4. VERIFY TASK FILTERING LOGIC
-- ==========================================

-- For a sample student, show which tasks they SHOULD see
-- Replace 'student@example.com' with actual student email
DO $$
DECLARE
  sample_student_id UUID;
  sample_student_email TEXT := 'roybasu1452@gmail.com'; -- Change this to test student
BEGIN
  -- Get student ID
  SELECT id INTO sample_student_id
  FROM profiles
  WHERE email = sample_student_email;

  IF sample_student_id IS NULL THEN
    RAISE NOTICE 'Student not found: %', sample_student_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Testing for student: % (ID: %)', sample_student_email, sample_student_id;

  -- Show student's enrolled courses
  RAISE NOTICE '--- Enrolled Courses ---';
  FOR rec IN (
    SELECT c.id, c.title
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = sample_student_id
  ) LOOP
    RAISE NOTICE 'Course: % (ID: %)', rec.title, rec.id;
  END LOOP;

  -- Show tasks student should see
  RAISE NOTICE '--- Tasks Student Should See ---';
  FOR rec IN (
    SELECT t.id, t.title, c.title as course_title
    FROM tasks t
    JOIN courses c ON t.course_id = c.id
    WHERE t.course_id IN (
      SELECT course_id FROM enrollments WHERE user_id = sample_student_id
    )
    AND t.status = 'active'
  ) LOOP
    RAISE NOTICE 'Task: % (Course: %)', rec.title, rec.course_title;
  END LOOP;
END $$;

-- ==========================================
-- 5. ADD NOT NULL CONSTRAINT (OPTIONAL)
-- ==========================================

-- This ensures future tasks/projects MUST have course_id
-- Uncomment if you want to enforce this:

/*
-- First, assign orphan tasks to a default course or delete them
UPDATE tasks 
SET course_id = (SELECT id FROM courses LIMIT 1)
WHERE course_id IS NULL;

-- Then add NOT NULL constraint
ALTER TABLE tasks 
ALTER COLUMN course_id SET NOT NULL;

-- Same for projects
UPDATE projects 
SET course_id = (SELECT id FROM courses LIMIT 1)
WHERE course_id IS NULL;

ALTER TABLE projects 
ALTER COLUMN course_id SET NOT NULL;
*/

-- ==========================================
-- 6. COUNT TASKS/PROJECTS PER COURSE
-- ==========================================

-- See distribution of tasks across courses
SELECT 
  c.id,
  c.title as course_title,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT p.id) as total_projects
FROM courses c
LEFT JOIN tasks t ON c.id = t.course_id
LEFT JOIN projects p ON c.id = p.course_id
GROUP BY c.id, c.title
ORDER BY c.title;

-- ==========================================
-- 7. FIND CROSS-CONTAMINATION ISSUES
-- ==========================================

-- Check if any student is seeing tasks from non-enrolled courses
-- This query will show mismatches
SELECT 
  prof.email as student_email,
  prof.full_name as student_name,
  t.title as task_title,
  c.title as task_course,
  'STUDENT NOT ENROLLED IN THIS COURSE!' as issue
FROM profiles prof
CROSS JOIN tasks t
JOIN courses c ON t.course_id = c.id
WHERE prof.role = 'student'
AND t.status = 'active'
AND NOT EXISTS (
  SELECT 1 
  FROM enrollments e 
  WHERE e.user_id = prof.id 
  AND e.course_id = t.course_id
)
LIMIT 20;

COMMIT;

-- ==========================================
-- ✅ DIAGNOSTICS COMPLETE
-- ==========================================
-- 
-- WHAT TO LOOK FOR:
-- ✅ Check section 1 & 2 for orphan tasks/projects (NULL course_id)
-- ✅ Check section 3 to verify student enrollments are correct
-- ✅ Check section 6 for task/project distribution
-- ✅ Check section 7 for any cross-contamination
--
-- IF ORPHAN TASKS FOUND:
-- Either assign them to a course or delete them
--
-- IF CODE IS CORRECT:
-- The filtering logic in the API is already correct!
-- The issue is likely in the database data itself.
--
-- ==========================================
