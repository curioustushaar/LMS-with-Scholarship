-- Add profile_image_url column to users table if missing
-- Run this in your Supabase SQL editor, then run:
-- NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN profile_image_url TEXT;
  END IF;
END$$;

-- Reload PostgREST / postgREST schema cache
NOTIFY pgrst, 'reload schema';
