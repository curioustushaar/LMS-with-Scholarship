-- Migration: Fix task_submissions status constraint and ensure columns exist

DO $$ 
BEGIN
  -- 1. Drop the old constraint if it exists
  ALTER TABLE task_submissions DROP CONSTRAINT IF EXISTS task_submissions_status_check;

  -- 2. Add the comprehensive constraint that matches our code
  -- We include 'pending', 'submitted', 'reviewed', 'approved', 'rejected', 'evaluated'
  ALTER TABLE task_submissions 
  ADD CONSTRAINT task_submissions_status_check 
  CHECK (status IN ('pending', 'submitted', 'reviewed', 'approved', 'rejected', 'evaluated'));

  -- 3. Ensure points_awarded exists (some versions might have used marks_obtained)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'points_awarded') THEN
    ALTER TABLE task_submissions ADD COLUMN points_awarded INTEGER DEFAULT 0;
  END IF;

  -- 4. Ensure reviewed_at and reviewed_by exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'reviewed_at') THEN
    ALTER TABLE task_submissions ADD COLUMN reviewed_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_submissions' AND column_name = 'reviewed_by') THEN
    ALTER TABLE task_submissions ADD COLUMN reviewed_by UUID REFERENCES users(id);
  END IF;

  RAISE NOTICE 'Task submissions schema fixed successfully';
END $$;

-- Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
