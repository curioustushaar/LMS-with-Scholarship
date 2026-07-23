-- Fix Admin Role for admin@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Check current status
SELECT 
  'BEFORE FIX' as status,
  u.id,
  u.email,
  u.role,
  u.full_name,
  u.status
FROM public.users u
WHERE u.email = 'admin@gmail.com';

-- Step 2: Insert or Update admin role
INSERT INTO public.users (id, email, full_name, role, status, created_at, updated_at)
SELECT 
  au.id,
  'admin@gmail.com',
  'LMS Administrator',
  'admin',
  'active',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  full_name = 'LMS Administrator',
  status = 'active',
  updated_at = NOW();

-- Step 3: Verify the fix
SELECT 
  'AFTER FIX ✅' as status,
  u.id,
  u.email,
  u.role,
  u.full_name,
  u.status,
  au.email as auth_email,
  au.confirmed_at IS NOT NULL as is_confirmed
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@gmail.com';

-- Expected Result:
-- role should be 'admin'
-- status should be 'active'
-- is_confirmed should be true
