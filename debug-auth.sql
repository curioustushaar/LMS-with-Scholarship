-- ========================================
-- DEBUG AUTHENTICATION - RUN THIS
-- ========================================
-- Ye query Supabase SQL Editor mein run karo

-- 1️⃣ Check if user exists in auth.users
SELECT 
  '1️⃣ AUTH USER CHECK' as step,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ USER NOT FOUND - Create user in Authentication → Users'
    WHEN COUNT(*) > 0 THEN '✅ User exists in auth'
  END as status,
  COUNT(*) as user_count
FROM auth.users
WHERE email = 'admin@lms.com';

-- 2️⃣ Check user confirmation status
SELECT 
  '2️⃣ CONFIRMATION STATUS' as step,
  email,
  CASE 
    WHEN confirmed_at IS NULL THEN '❌ NOT CONFIRMED - User must confirm email or enable Auto Confirm'
    ELSE '✅ CONFIRMED'
  END as confirmation_status,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@lms.com';

-- 3️⃣ Check if user is in public.users with admin role
SELECT 
  '3️⃣ PUBLIC USERS TABLE' as step,
  email,
  role,
  status,
  CASE 
    WHEN role = 'admin' AND status = 'active' THEN '✅ Admin setup correct'
    WHEN role != 'admin' THEN '❌ User is not admin'
    WHEN status != 'active' THEN '❌ User is not active'
    ELSE '❌ Something wrong'
  END as admin_status
FROM public.users
WHERE email = 'admin@lms.com';

-- 4️⃣ Final combined check
SELECT 
  '4️⃣ FINAL STATUS' as step,
  CASE 
    WHEN au.email IS NULL THEN '❌ CREATE USER: Go to Authentication → Users → Add User'
    WHEN au.confirmed_at IS NULL THEN '❌ USER NOT CONFIRMED: Delete and recreate with Auto Confirm ON'
    WHEN pu.email IS NULL THEN '🔧 UPDATE PUBLIC TABLE: Run setup-admin-user.sql script'
    WHEN pu.role != 'admin' THEN '🔧 FIX ROLE: Run UPDATE users SET role = admin WHERE email = admin@lms.com'
    ELSE '✅ ALL PERFECT - Password might be wrong, reset it!'
  END as action_needed
FROM auth.users au
FULL OUTER JOIN public.users pu ON pu.email = au.email
WHERE au.email = 'admin@lms.com' OR pu.email = 'admin@lms.com';

-- ========================================
-- SOLUTIONS BASED ON RESULTS:
-- ========================================

-- SOLUTION A: If user NOT found in auth.users
-- Go to: Authentication → Users → Add User
-- Email: admin@lms.com
-- Password: Admin@123456
-- ✅ Check "Auto Confirm User"

-- SOLUTION B: If user NOT confirmed
-- Delete existing user and recreate with Auto Confirm ON
-- OR manually confirm:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@lms.com';

-- SOLUTION C: If everything looks good but still failing
-- Password might be wrong - reset it:
-- 1. Go to Authentication → Users
-- 2. Click three dots next to admin@lms.com
-- 3. Click "Reset Password"
-- 4. Use temporary password to login

-- SOLUTION D: Create fresh admin user with strong password
-- 1. Delete old user (if exists)
-- 2. Create new with these exact steps:
--    Authentication → Users → Add User
--    Email: admin@lms.com
--    Password: LmsAdmin@2026!
--    ✅ Auto Confirm User
-- 3. Run this:
INSERT INTO public.users (email, full_name, role, status, created_at, updated_at)
VALUES ('admin@lms.com', 'Admin User', 'admin', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'active';
