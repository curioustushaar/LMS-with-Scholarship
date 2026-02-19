-- ==========================================
-- COMPLETE FIX: SYNC ALL USERS WITH AUTO AUTH CREATION
-- ==========================================
-- This will create auth accounts for users who don't have them
-- Then sync everything to profiles table
-- Date: February 18, 2026

BEGIN;

-- ==========================================
-- 1. CHECK MISSING AUTH ACCOUNTS
-- ==========================================

SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.status,
  'NO AUTH ACCOUNT - NEEDS CREATION' as issue
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL
ORDER BY u.role, u.created_at;

-- ==========================================
-- 2. SYNC USERS WHO HAVE AUTH ACCOUNTS
-- ==========================================

-- First, sync users who already have auth accounts
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
  u.status as account_status,
  u.profile_image_url,
  u.created_at,
  COALESCE(u.updated_at, NOW())
FROM users u
INNER JOIN auth.users au ON u.id = au.id
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
-- 3. VERIFY CURRENT STATUS
-- ==========================================

SELECT 
  'PROFILES TABLE' as location,
  role,
  account_status,
  COUNT(*) as count
FROM profiles
GROUP BY role, account_status
ORDER BY role;

SELECT 
  'USERS TABLE' as location,
  role,
  status,
  COUNT(*) as count
FROM users
GROUP BY role, status
ORDER BY role;

-- ==========================================
-- 4. LIST USERS WITHOUT AUTH ACCOUNTS
-- ==========================================

SELECT 
  'USERS MISSING AUTH ACCOUNTS:' as heading,
  u.email,
  u.full_name,
  u.role,
  '⚠️ Create these users manually via Admin Panel Student Creation' as action
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

COMMIT;

-- ==========================================
-- IMPORTANT NOTES
-- ==========================================
-- ✅ Users with auth accounts are now synced to profiles
-- ⚠️ Users without auth accounts cannot be auto-created via SQL
--    (Supabase security prevents direct auth.users manipulation)
--
-- TO FIX MISSING USERS:
-- 1. Delete them from 'users' table (they're invalid anyway)
-- 2. Re-create them properly via Admin Panel → Students → Create
--    This will create proper auth accounts + profiles entries
--
-- DELETE INVALID USERS (Optional):
-- DELETE FROM users 
-- WHERE id NOT IN (SELECT id FROM auth.users);
