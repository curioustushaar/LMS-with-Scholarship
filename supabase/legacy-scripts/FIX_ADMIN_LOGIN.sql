-- ==========================================
-- FIX: ADMIN LOGIN NOT WORKING
-- ==========================================
-- Problem: Admin user cannot login
-- Solution: Ensure admin exists in profiles table with correct role
-- Date: February 18, 2026

BEGIN;

-- ==========================================
-- 1. CHECK ADMIN USER STATUS
-- ==========================================

-- Check if admin exists in auth.users
SELECT 
  'AUTH.USERS' as location,
  id, 
  email,
  raw_app_meta_data->>'role' as metadata_role,
  created_at
FROM auth.users
WHERE email = 'admin@gmail.com';

-- Check if admin exists in profiles table
SELECT 
  'PROFILES TABLE' as location,
  id,
  email,
  full_name,
  role,
  account_status,
  created_at
FROM profiles
WHERE email = 'admin@gmail.com';

-- Check if admin exists in old users table
SELECT 
  'USERS TABLE' as location,
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM users
WHERE email = 'admin@gmail.com';

-- ==========================================
-- 2. FIX: INSERT/UPDATE ADMIN IN PROFILES
-- ==========================================

-- Get admin ID from auth.users
DO $$
DECLARE
  admin_auth_id UUID;
  admin_email TEXT := 'admin@gmail.com';
BEGIN
  -- Get admin user ID from auth.users
  SELECT id INTO admin_auth_id
  FROM auth.users
  WHERE email = admin_email;

  IF admin_auth_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found in auth.users! Email: %', admin_email;
  END IF;

  -- Insert or update admin in profiles table
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    account_status,
    created_at,
    updated_at
  )
  VALUES (
    admin_auth_id,
    admin_email,
    'Ankit kumar gupta',
    'admin',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = 'admin',  -- Force admin role
    account_status = 'active',  -- Force active status
    updated_at = NOW();

  RAISE NOTICE 'Admin user synced to profiles table with ID: %', admin_auth_id;
END $$;

-- ==========================================
-- 3. UPDATE AUTH METADATA
-- ==========================================

-- Set admin role in auth.users metadata (for extra safety)
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  ),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  ),
  updated_at = NOW()
WHERE email = 'admin@gmail.com';

-- ==========================================
-- 4. VERIFY ADMIN IS FIXED
-- ==========================================

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.account_status,
  au.raw_app_meta_data->>'role' as auth_metadata_role,
  'ADMIN READY ✅' as status
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'admin@gmail.com'
AND p.role = 'admin';

-- ==========================================
-- 5. CHECK ALL ADMINS
-- ==========================================

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.account_status
FROM profiles p
WHERE p.role = 'admin'
ORDER BY p.created_at;

COMMIT;

-- ==========================================
-- SUCCESS! 
-- ==========================================
-- Admin user is now properly set up in profiles table
-- Test login with:
-- Email: admin@gmail.com
-- Password: (your existing password)
--
-- If you still cannot login, it might be a password issue.
-- Reset password from Supabase Dashboard:
-- Authentication → Users → Find admin@gmail.com → Reset Password
