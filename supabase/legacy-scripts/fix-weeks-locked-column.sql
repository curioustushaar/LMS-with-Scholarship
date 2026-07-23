-- Comprehensive Migration: Fix weeks table schema
-- This adds missing columns that the API expects: locked, created_at, updated_at

DO $$ 
BEGIN
  -- Add 'locked' column to weeks table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'locked') THEN
    ALTER TABLE weeks ADD COLUMN locked BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added locked column to weeks table';
  END IF;

  -- Add 'created_at' column to weeks table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'created_at') THEN
    ALTER TABLE weeks ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to weeks table';
  END IF;

  -- Add 'updated_at' column to weeks table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'updated_at') THEN
    ALTER TABLE weeks ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to weeks table';
  END IF;

END $$;

-- IMPORTANT: Force PostgREST to reload the schema cache
-- This fixes the "Could not find column in schema cache" error
NOTIFY pgrst, 'reload schema';

-- Verify the columns
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'weeks'
ORDER BY ordinal_position;
