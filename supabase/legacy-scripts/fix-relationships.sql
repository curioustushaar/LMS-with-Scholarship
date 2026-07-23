-- Migration: Fix relationships and refresh schema cache
-- This ensures that the join between task_submissions and users works correctly

-- 1. Ensure foreign key exists for task_submissions -> users (student)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'task_submissions_user_id_fkey') THEN
    ALTER TABLE task_submissions 
    ADD CONSTRAINT task_submissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Ensure foreign key exists for task_submissions -> tasks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'task_submissions_task_id_fkey') THEN
    ALTER TABLE task_submissions 
    ADD CONSTRAINT task_submissions_task_id_fkey 
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Refresh the PostgREST schema cache
-- This is the most important step for resolving "relationship not found" errors
NOTIFY pgrst, 'reload schema';
