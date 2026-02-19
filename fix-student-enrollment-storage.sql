-- ==========================================
-- FIX: Student Course Enrollment Storage Issue
-- ==========================================
-- Run this in Supabase SQL Editor to fix NULL enrolled_course_ids

-- 1. Check current column type for enrolled_course_ids
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'enrolled_course_ids';

-- 2. If column doesn't exist or wrong type, create/fix it
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS enrolled_course_ids UUID[] DEFAULT '{}';

-- 3. Update NULL values with proper course IDs from enrollments
UPDATE users 
SET enrolled_course_ids = (
  SELECT ARRAY_AGG(e.course_id)
  FROM enrollments e
  WHERE e.user_id = users.id
)
WHERE enrolled_course_ids IS NULL 
OR enrolled_course_ids = '{}';

-- 4. Verify the fix - Check roybabu1452@gmail.com specifically
SELECT 
  u.email,
  u.full_name,
  u.enrolled_course_ids,
  ARRAY_AGG(c.title) as enrolled_courses
FROM users u
LEFT JOIN enrollments e ON e.user_id = u.id
LEFT JOIN courses c ON c.id = e.course_id
WHERE u.email = 'roybabu1452@gmail.com'
GROUP BY u.id, u.email, u.full_name, u.enrolled_course_ids;

-- 5. Show all enrollments for debugging
SELECT 
  u.email,
  u.full_name,
  c.title as course_name,
  e.enrolled_at,
  u.enrolled_course_ids
FROM users u
JOIN enrollments e ON e.user_id = u.id
JOIN courses c ON c.id = e.course_id
WHERE u.role = 'student'
ORDER BY e.enrolled_at DESC;