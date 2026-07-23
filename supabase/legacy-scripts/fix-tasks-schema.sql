-- Migration: Fix tasks table schema missing columns

DO $$ 
BEGIN
  -- Check and add status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
    ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'));
    RAISE NOTICE 'Added status column to tasks table';
  END IF;

  -- Check and add max_points if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'max_points') THEN
    ALTER TABLE tasks ADD COLUMN max_points INTEGER DEFAULT 100;
    RAISE NOTICE 'Added max_points column to tasks table';
  END IF;

  -- Check and add task_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'task_type') THEN
    ALTER TABLE tasks ADD COLUMN task_type VARCHAR(50) DEFAULT 'assignment';
    RAISE NOTICE 'Added task_type column to tasks table';
  END IF;

  -- Check and add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'updated_at') THEN
    ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to tasks table';
  END IF;

  -- Check and add created_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_at') THEN
    ALTER TABLE tasks ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to tasks table';
  END IF;

END $$;

-- Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
