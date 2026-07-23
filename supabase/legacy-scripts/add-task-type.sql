-- Add task_type and deadline columns fix for tasks table

-- First, ensure deadline column exists and is NOT NULL
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'deadline') THEN
    -- Column exists, ensure it has proper constraint
    ALTER TABLE tasks ALTER COLUMN deadline SET DEFAULT NOW();
    ALTER TABLE tasks ALTER COLUMN deadline SET NOT NULL;
  ELSE
    -- Column doesn't exist, add it
    ALTER TABLE tasks ADD COLUMN deadline TIMESTAMP DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- Ensure task_type column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'task_type') THEN
    -- Column exists, ensure it has proper constraint
    ALTER TABLE tasks ALTER COLUMN task_type SET DEFAULT 'assignment';
  ELSE
    -- Column doesn't exist, add it
    ALTER TABLE tasks ADD COLUMN task_type VARCHAR(50) DEFAULT 'assignment' CHECK (task_type IN ('assignment', 'quiz', 'project', 'discussion', 'submission'));
  END IF;
END $$;

-- Set default value for any existing rows that might have NULL task_type
UPDATE tasks SET task_type = 'assignment' WHERE task_type IS NULL;

-- Make the task_type column NOT NULL
ALTER TABLE tasks ALTER COLUMN task_type SET NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name IN ('task_type', 'deadline')
ORDER BY column_name;
