-- Fix Authentication Database Error
-- Run this in Supabase SQL Editor to fix the user creation error

-- Step 1: Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create a better trigger function that won't fail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users only if it doesn't exist
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'student', -- Default role, you can change to admin manually
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Don't fail if user already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Now you can create admin user
-- After running this SQL, go back to Authentication -> Users -> Add User
-- Email: admin@lms.com
-- Password: LmsAdmin@2026!
-- Check: Auto Confirm User
-- Click: Create user

-- Step 5: Then run this to make them admin
UPDATE public.users 
SET role = 'admin'
WHERE email = 'admin@lms.com';

-- Verify
SELECT 
  u.id,
  u.email,
  u.role,
  au.email as auth_email,
  au.confirmed_at IS NOT NULL as is_confirmed
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@lms.com';
