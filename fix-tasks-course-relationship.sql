-- Fix tasks-courses relationship
-- This adds the course_id foreign key if it doesn't exist properly

-- First, check if the column exists
DO $$ 
BEGIN
  -- Drop the column if it exists without proper constraint
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'course_id') THEN
    -- Drop existing foreign key constraint if any
    ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_course_id_fkey;
  ELSE
    -- Add the column if it doesn't exist
    ALTER TABLE tasks ADD COLUMN course_id UUID;
  END IF;
  
  -- Now add the foreign key constraint
  ALTER TABLE tasks ADD CONSTRAINT tasks_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;
  
  RAISE NOTICE 'Foreign key relationship between tasks and courses created successfully';
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
