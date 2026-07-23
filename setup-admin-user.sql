-- =============================================
-- COMPLETE ADMIN USER SETUP - COPY PASTE KARO
-- =============================================
-- Ye script Supabase SQL Editor mein paste karke RUN karo

-- Step 1: Check if user exists in auth
SELECT 
  '🔍 CHECKING AUTH USER' as status,
  id, 
  email, 
  confirmed_at,
  CASE 
    WHEN confirmed_at IS NULL THEN '❌ NOT CONFIRMED - Create user with Auto Confirm ON'
    ELSE '✅ CONFIRMED'
  END as confirmation_status
FROM auth.users
WHERE email = 'admin@lms.com';

-- Step 2: Create/Update user in public.users table
INSERT INTO public.users (
  email, 
  full_name, 
  role, 
  status,
  created_at,
  updated_at
) 
VALUES (
  'admin@lms.com', 
  'Admin User', 
  'admin', 
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin', 
  status = 'active',
  updated_at = NOW();

-- Step 3: Verify everything is set up correctly
SELECT 
  '✅ FINAL VERIFICATION' as status,
  au.email as auth_email,
  au.confirmed_at as auth_confirmed,
  pu.email as public_email,
  pu.role as user_role,
  pu.status as user_status,
  CASE 
    WHEN au.email IS NULL THEN '❌ Create user in Authentication first!'
    WHEN au.confirmed_at IS NULL THEN '❌ User not confirmed'
    WHEN pu.email IS NULL THEN '❌ User not in public.users table'
    WHEN pu.role != 'admin' THEN '❌ User is not admin'
    WHEN pu.status != 'active' THEN '❌ User is not active'
    ELSE '✅ ALL GOOD! Try logging in now.'
  END as final_status
FROM auth.users au
FULL OUTER JOIN public.users pu ON pu.email = au.email
WHERE 
  au.email = 'admin@lms.com' 
  OR pu.email = 'admin@lms.com';

-- =============================================
-- IMPORTANT NOTES:
-- =============================================
-- 1. Agar "Auth User Found" query mein koi result nahi aaya,
--    to pehle Supabase Dashboard se user create karo:
--    Authentication > Users > Add User
--    Email: admin@lms.com
--    Password: Admin@123456
--    Auto Confirm: ✅ CHECK KARO!
--
-- 2. Agar "ALL GOOD" message aaya,
--    to ab login kar sakte ho!
--    URL: http://localhost:3001/login
--    Email: admin@lms.com
--    Password: Admin@123456 (jo create karte time set kiya)
--
-- 3. Password bhool gaye to reset karo:
--    Authentication > Users > ... > Reset Password
-- =============================================
