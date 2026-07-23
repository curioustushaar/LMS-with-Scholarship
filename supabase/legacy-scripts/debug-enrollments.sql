-- Debug enrollments table and check database structure
-- Run this in Supabase SQL Editor

-- 1. Check if enrollments table exists
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'enrollments'
ORDER BY ordinal_position;

-- 2. Check current enrollment data
SELECT 
  e.id,
  e.user_id,
  e.course_id,
  u.email as student_email,
  c.title as course_title,
  e.enrolled_at
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC;

-- 3. Check if RLS is enabled on enrollments table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'enrollments';

-- 4. List all policies on enrollments table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'enrollments';

-- 5. Count total enrollments
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- 6. Check users table structure to see if we need to add anything
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE '%course%'
ORDER BY ordinal_position;