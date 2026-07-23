-- Fix User Roles for LMS Admin and Students
-- Run this in your Supabase SQL Editor

-- 1. Set admin role for your admin email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@gmail.com';

-- 2. Set student role for student emails
UPDATE public.users 
SET role = 'student' 
WHERE email IN ('himu1@gmail.com', 'lms12@gmail.com', 'lms234@gmail.com');

-- 3. Also sync to profiles table if it exists
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@gmail.com';

UPDATE public.profiles 
SET role = 'student' 
WHERE email IN ('himu1@gmail.com', 'lms12@gmail.com', 'lms234@gmail.com');

-- Verify results
SELECT id, email, role, full_name FROM public.users WHERE email IN ('admin@gmail.com', 'himu1@gmail.com', 'lms12@gmail.com', 'lms234@gmail.com');
