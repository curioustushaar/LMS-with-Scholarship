-- Migration: add domain columns to courses and users
-- Run this in Supabase SQL editor

-- 1. Add domain to courses
ALTER TABLE IF EXISTS public.courses
  ADD COLUMN IF NOT EXISTS domain VARCHAR(128);

-- 2. Add domain to users table (for student's registered domain)
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS domain VARCHAR(128);

-- 3. Add domain to profiles (fallback table) if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS domain VARCHAR(128);
  END IF;
END$$;

-- 4. Optional: create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_domain ON public.courses(domain);
CREATE INDEX IF NOT EXISTS idx_users_domain ON public.users(domain);
