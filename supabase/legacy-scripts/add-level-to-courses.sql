-- Migration: Add missing 'level' column to courses table
-- This fixes the PGRST204 error when creating or updating courses

-- Step 1: Add the level column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'level') THEN
    ALTER TABLE courses ADD COLUMN level VARCHAR(50) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced'));
    RAISE NOTICE 'Added level column to courses table';
  ELSE
    RAISE NOTICE 'Level column already exists in courses table';
  END IF;
END $$;

-- Step 2: Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'courses' AND column_name = 'level';
