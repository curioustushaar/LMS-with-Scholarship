-- Migration: Add student details (phone, parents_contact, class, school_coaching) to profiles table
-- Date: 2026-10-31

DO $$
BEGIN
  -- Add phone column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone VARCHAR(255);
    RAISE NOTICE 'Added phone column to profiles table';
  END IF;

  -- Add parents_contact column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parents_contact') THEN
    ALTER TABLE public.profiles ADD COLUMN parents_contact VARCHAR(255);
    RAISE NOTICE 'Added parents_contact column to profiles table';
  END IF;

  -- Add class column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'class') THEN
    ALTER TABLE public.profiles ADD COLUMN class VARCHAR(255);
    RAISE NOTICE 'Added class column to profiles table';
  END IF;

  -- Add school_coaching column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'school_coaching') THEN
    ALTER TABLE public.profiles ADD COLUMN school_coaching VARCHAR(255);
    RAISE NOTICE 'Added school_coaching column to profiles table';
  END IF;
END $$;

-- Create indexes for searching
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles(class);
