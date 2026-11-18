-- Migration: Add assigned_school to profiles (for admin assignment) and school_id (for students)
-- Date: 2026-10-31

DO $$
BEGIN
  -- Add assigned_school_id column to profiles (which school is assigned to this admin)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'assigned_school_id') THEN
    ALTER TABLE public.profiles ADD COLUMN assigned_school_id VARCHAR(255);
    RAISE NOTICE 'Added assigned_school_id column to profiles table';
  END IF;

  -- Add assigned_school_name column to profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'assigned_school_name') THEN
    ALTER TABLE public.profiles ADD COLUMN assigned_school_name VARCHAR(255);
    RAISE NOTICE 'Added assigned_school_name column to profiles table';
  END IF;

  -- Add school_id column to profiles (for students belonging to a school)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'school_id') THEN
    ALTER TABLE public.profiles ADD COLUMN school_id VARCHAR(255);
    RAISE NOTICE 'Added school_id column to profiles table';
  END IF;

  -- Add assigned_admin_id column to schools table (which admin is coordinating with this school)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'assigned_admin_id') THEN
    ALTER TABLE public.schools ADD COLUMN assigned_admin_id VARCHAR(255);
    RAISE NOTICE 'Added assigned_admin_id column to schools table';
  END IF;

  -- Add assigned_admin_name column to schools table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'assigned_admin_name') THEN
    ALTER TABLE public.schools ADD COLUMN assigned_admin_name VARCHAR(255);
    RAISE NOTICE 'Added assigned_admin_name column to schools table';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_school_id ON public.profiles(assigned_school_id);
