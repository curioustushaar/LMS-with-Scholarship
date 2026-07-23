-- ==========================================
-- MIGRATE FROM USERS TABLE TO PROFILES TABLE
-- ==========================================
-- Run this in Supabase SQL Editor
-- This updates all RLS policies and triggers to use 'profiles' table instead of 'users'
-- 
-- IMPORTANT: Run this AFTER deploying the code changes that use profiles table
-- Date: February 18, 2026

BEGIN;

-- ==========================================
-- 1. UPDATE RLS POLICIES TO USE PROFILES
-- ==========================================

-- Drop old policies that reference 'users' table
DROP POLICY IF EXISTS "Admin full access to project_deliverables" ON project_deliverables;
DROP POLICY IF EXISTS "Admin full access to tickets" ON tickets;
DROP POLICY IF EXISTS "Admin full access to ticket_messages" ON ticket_messages;
DROP POLICY IF EXISTS "Admin full access to certificates" ON certificates;
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP POLICY IF EXISTS "Admin full access to tasks" ON tasks;
DROP POLICY IF EXISTS "Admin full access to courses" ON courses;
DROP POLICY IF EXISTS "Admin full access to videos" ON videos;
DROP POLICY IF EXISTS "Admin full access to weeks" ON weeks;

-- Create new policies using 'profiles' table
CREATE POLICY "Admin full access to project_deliverables"
ON project_deliverables FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to tickets"
ON tickets FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to ticket_messages"
ON ticket_messages FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to certificates"
ON certificates FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to projects"
ON projects FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to tasks"
ON tasks FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to courses"
ON courses FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to videos"
ON videos FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin full access to weeks"
ON weeks FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Student access policies
CREATE POLICY "Students can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students can view enrolled courses"
ON courses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = courses.id 
    AND enrollments.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view their tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollments 
    WHERE enrollments.course_id = tasks.course_id 
    AND enrollments.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view their projects"
ON projects FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students can view their tickets"
ON tickets FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ==========================================
-- 2. UPDATE STORAGE POLICIES
-- ==========================================

-- Update storage bucket policies for avatars
DROP POLICY IF EXISTS "Admin upload avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

CREATE POLICY "Admin upload avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- ==========================================
-- 3. REMOVE OLD TRIGGERS (if using enrolled_course_ids column)
-- ==========================================

-- Drop trigger that syncs enrollments to users.enrolled_course_ids
-- This is no longer needed since we use enrollments table only
DROP TRIGGER IF EXISTS trigger_sync_user_enrolled_courses ON enrollments;
DROP FUNCTION IF EXISTS sync_user_enrolled_courses();

-- ==========================================
-- 4. VERIFY PROFILES TABLE STRUCTURE
-- ==========================================

-- Ensure profiles table has all needed columns
-- (These should already exist if you're using Supabase Auth)
DO $$ 
BEGIN
  -- Add account_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status VARCHAR(50) DEFAULT 'active';
  END IF;

  -- Add role if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'student';
  END IF;

  -- Add profile_image_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_image_url TEXT;
  END IF;
END $$;

-- ==========================================
-- 5. MIGRATE DATA FROM USERS TO PROFILES (if needed)
-- ==========================================

-- CAUTION: Only run this if you have data in 'users' table that's not in 'profiles'
-- This will copy users data to profiles table
-- Uncomment the following section ONLY if you need to migrate existing data:

/*
INSERT INTO profiles (id, email, full_name, role, account_status, profile_image_url, created_at)
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.status as account_status,
  u.profile_image_url,
  u.created_at
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  account_status = EXCLUDED.account_status,
  profile_image_url = EXCLUDED.profile_image_url;
*/

-- ==========================================
-- 6. UPDATE FOREIGN KEYS (if needed)
-- ==========================================

-- Most tables should already reference auth.users(id) via profiles
-- If you have any tables with explicit FOREIGN KEY to users table, update them:

-- Example (uncomment if needed):
-- ALTER TABLE video_progress DROP CONSTRAINT IF EXISTS video_progress_user_id_fkey;
-- ALTER TABLE video_progress ADD CONSTRAINT video_progress_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ==========================================
-- 7. VERIFICATION QUERIES
-- ==========================================

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Count users in profiles table
SELECT 
  role,
  account_status,
  COUNT(*) as count
FROM profiles
GROUP BY role, account_status;

-- Verify enrollments are working
SELECT 
  e.id,
  p.email,
  p.full_name,
  c.title as course_title
FROM enrollments e
JOIN profiles p ON e.user_id = p.id
JOIN courses c ON e.course_id = c.id
LIMIT 5;

COMMIT;

-- ==========================================
-- DONE! 
-- ==========================================
-- Your database now uses 'profiles' table exclusively
-- The old 'users' table can be dropped after verifying everything works:
-- 
-- DROP TABLE IF EXISTS users CASCADE;
--
-- (Only do this after thorough testing!)
