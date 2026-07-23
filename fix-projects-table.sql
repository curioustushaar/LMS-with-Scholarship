-- Fix projects table - Add deadline column and fix other issues

-- Step 1: Add deadline column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
    ALTER TABLE projects ADD COLUMN deadline TIMESTAMP;
    RAISE NOTICE 'Added deadline column to projects table';
  ELSE
    RAISE NOTICE 'deadline column already exists';
  END IF;
END $$;

-- Step 2: Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Step 3: Verify the columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;
