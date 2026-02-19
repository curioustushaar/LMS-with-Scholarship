-- Comprehensive Migration: Fix courses table schema
-- This adds ALL missing columns that the API expects

DO $$ 
BEGIN
  -- Add 'status' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
    ALTER TABLE courses ADD COLUMN status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived'));
    RAISE NOTICE 'Added status column to courses table';
  END IF;

  -- Add 'level' column  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'level') THEN
    ALTER TABLE courses ADD COLUMN level VARCHAR(50) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced'));
    RAISE NOTICE 'Added level column to courses table';
  END IF;

  -- Add 'thumbnail_url' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
    RAISE NOTICE 'Added thumbnail_url column to courses table';
  END IF;

  -- Add 'duration_weeks' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration_weeks') THEN
    ALTER TABLE courses ADD COLUMN duration_weeks INTEGER;
    RAISE NOTICE 'Added duration_weeks column to courses table';
  END IF;

  -- Add 'description' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'description') THEN
    ALTER TABLE courses ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to courses table';
  END IF;

  -- Add 'created_at' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'created_at') THEN
    ALTER TABLE courses ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to courses table';
  END IF;

  -- Add 'updated_at' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'updated_at') THEN
    ALTER TABLE courses ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to courses table';
  END IF;

  -- Add 'created_by' column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'created_by') THEN
    ALTER TABLE courses ADD COLUMN created_by UUID REFERENCES users(id);
    RAISE NOTICE 'Added created_by column to courses table';
  END IF;

END $$;

-- Verify all columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;
