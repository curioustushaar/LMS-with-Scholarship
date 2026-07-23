-- ==========================================
-- FIX: SYNC MISSING USERS TO PROFILES TABLE
-- ==========================================
-- Problem: Dashboard shows only 2-3 students but database has more
-- Reason: Code now uses 'profiles' table but not all data copied from 'users' table
-- 
-- Run this in Supabase SQL Editor to sync all users to profiles
-- Date: February 18, 2026

BEGIN;

-- ==========================================
-- 1. CHECK CURRENT STATUS
-- ==========================================

-- See how many users vs profiles
SELECT 'USERS TABLE' as table_name, COUNT(*) as total_count, role, status
FROM users
GROUP BY role, status
UNION ALL
SELECT 'PROFILES TABLE' as table_name, COUNT(*) as total_count, role, account_status as status
FROM profiles
GROUP BY role, account_status
ORDER BY table_name, role;

-- ==========================================
-- 2. FIND MISSING USERS (in users but not in profiles)
-- ==========================================

SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.status,
  'MISSING IN PROFILES' as issue
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- ==========================================
-- 3. ADD MISSING COLUMNS TO PROFILES TABLE
-- ==========================================

-- Add columns if they don't exist
DO $$ 
BEGIN
  -- Add account_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status VARCHAR(50) DEFAULT 'active';
    RAISE NOTICE 'Added account_status column';
  END IF;

  -- Add role if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'student';
    RAISE NOTICE 'Added role column';
  END IF;

  -- Add profile_image_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_image_url TEXT;
    RAISE NOTICE 'Added profile_image_url column';
  END IF;

  -- Add created_at if it doesn't exist (usually exists in Supabase profiles)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added created_at column';
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column';
  END IF;
END $$;

-- ==========================================
-- 4. CHECK WHICH USERS HAVE AUTH ACCOUNTS
-- ==========================================

-- See which users from 'users' table exist in auth.users
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  CASE 
    WHEN au.id IS NOT NULL THEN 'HAS AUTH ACCOUNT'
    ELSE 'NO AUTH ACCOUNT'
  END as auth_status
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY auth_status, u.role;

-- ==========================================
-- 5. SYNC ONLY USERS WITH AUTH ACCOUNTS
-- ==========================================

-- Copy users from 'users' table to 'profiles' table
-- BUT ONLY if they exist in auth.users (have valid auth account)
INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  role, 
  account_status, 
  profile_image_url,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.status as account_status,  -- Map 'status' to 'account_status'
  u.profile_image_url,
  u.created_at,
  COALESCE(u.updated_at, NOW())
FROM users u
INNER JOIN auth.users au ON u.id = au.id  -- Only users with auth accounts
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  account_status = EXCLUDED.account_status,
  profile_image_url = EXCLUDED.profile_image_url,
  updated_at = NOW();

-- ==========================================
-- 6. VERIFY SYNC COMPLETED
-- ==========================================

-- Count again after sync
SELECT 
  'After Sync - PROFILES' as status,
  role,
  account_status,
  COUNT(*) as count
FROM profiles
GROUP BY role, account_status
ORDER BY role, account_status;

-- Show all students in profiles table
SELECT 
  id,
  email,
  full_name,
  role,
  account_status,
  created_at
FROM profiles
WHERE role = 'student'
ORDER BY created_at DESC;

-- ==========================================
-- 7. UPDATE RLS POLICIES (if not done already)
-- ==========================================

-- Enable RLS on profiles if not enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;

-- Create new policies for profiles table
CREATE POLICY "Admin can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admin can update all profiles"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ==========================================
-- 8. FINAL VERIFICATION
-- ==========================================

-- This should show ALL students including the missing ones
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN account_status = 'active' THEN 1 END) as active_students,
  COUNT(CASE WHEN account_status = 'inactive' THEN 1 END) as inactive_students
FROM profiles
WHERE role = 'student';

COMMIT;

-- ==========================================
-- SUCCESS! 
-- ==========================================
-- Users with auth accounts have been synced to profiles table
-- Your dashboard should now show all students
-- Refresh your admin dashboard to see the changes

-- ==========================================
-- IMPORTANT NOTE
-- ==========================================
-- If some users are still missing, it means they don't have Supabase Auth accounts.
-- The 'profiles' table has a foreign key to 'auth.users', so we can only sync
-- users that were created through Supabase Auth.
--
-- To fix users without auth accounts:
-- 1. Create them properly using the student creation API endpoint
-- 2. Or create auth accounts for them manually in Supabase Auth dashboard
-- 3. Then run this script again to sync their data
--
-- Check which users don't have auth accounts:
-- SELECT u.* FROM users u 
-- LEFT JOIN auth.users au ON u.id = au.id 
-- WHERE au.id IS NULL;
