-- ==========================================
-- FIX: Task Submissions Missing Columns
-- ==========================================
-- Run this in Supabase SQL Editor to add missing columns

-- Add missing columns to task_submissions table
ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS deploy_url TEXT,
ADD COLUMN IF NOT EXISTS project_name TEXT,
ADD COLUMN IF NOT EXISTS submission_file_url TEXT,
ADD COLUMN IF NOT EXISTS submission_description TEXT;

-- Update existing records to have proper default values
UPDATE task_submissions 
SET github_url = COALESCE(github_url, ''),
    deploy_url = COALESCE(deploy_url, ''),
    project_name = COALESCE(project_name, ''),
    submission_file_url = COALESCE(submission_file_url, ''),
    submission_description = COALESCE(submission_description, '');

-- Check the updated schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'task_submissions' 
ORDER BY ordinal_position;

-- Verify submissions data
SELECT 
  id,
  task_id,
  user_id,
  submission_url,
  submission_text,
  github_url,
  deploy_url,
  project_name,
  submission_file_url,
  submission_description,
  status,
  submitted_at
FROM task_submissions
ORDER BY submitted_at DESC
LIMIT 5;