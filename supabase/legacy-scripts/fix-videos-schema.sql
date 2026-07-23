-- Comprehensive Migration: Fix videos table schema (v2)
-- This fixes the "order" column constraint error and adds missing columns

DO $$ 
BEGIN
  -- 1. Fix the "order" column if it exists (it's often a source of errors as it's a reserved keyword)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'order') THEN
    ALTER TABLE videos ALTER COLUMN "order" DROP NOT NULL;
    ALTER TABLE videos ALTER COLUMN "order" SET DEFAULT 0;
    RAISE NOTICE 'Fixed "order" column constraint';
  END IF;

  -- 2. Add 'duration_minutes' column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'duration_minutes') THEN
    ALTER TABLE videos ADD COLUMN duration_minutes INTEGER;
    RAISE NOTICE 'Added duration_minutes column';
  END IF;

  -- 3. Add 'order_index' column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'order_index') THEN
    ALTER TABLE videos ADD COLUMN order_index INTEGER DEFAULT 0;
    RAISE NOTICE 'Added order_index column';
  END IF;

  -- 4. Add 'created_at' column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'created_at') THEN
    ALTER TABLE videos ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added created_at column';
  END IF;

  -- 5. Add 'updated_at' column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'updated_at') THEN
    ALTER TABLE videos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column';
  END IF;

  -- 6. Ensure video_url is TEXT
  ALTER TABLE videos ALTER COLUMN video_url TYPE TEXT;

END $$;

-- Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;
