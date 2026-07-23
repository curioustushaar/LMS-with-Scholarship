-- ==========================================
-- ADD MISSING COLUMNS TO task_submissions
-- ==========================================
-- This adds all the missing columns needed for file uploads
-- and enhanced task submission features
-- ==========================================

BEGIN;

-- Add missing columns to task_submissions table
ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS deploy_url TEXT,
ADD COLUMN IF NOT EXISTS project_name TEXT,
ADD COLUMN IF NOT EXISTS submission_file_url TEXT,
ADD COLUMN IF NOT EXISTS submission_description TEXT;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'task_submissions' 
  AND column_name IN (
    'github_url',
    'deploy_url', 
    'project_name',
    'submission_file_url',
    'submission_description'
  )
ORDER BY column_name;

COMMIT;

-- ==========================================
-- VERIFY EXISTING SUBMISSIONS
-- ==========================================

-- Check recent submissions to see if file_url exists
SELECT 
  id,
  project_name,
  submission_url,
  github_url,
  deploy_url,
  submission_file_url,
  status,
  submitted_at
FROM task_submissions
ORDER BY submitted_at DESC
LIMIT 10;

-- ==========================================
-- ✅ MIGRATION COMPLETE
-- ==========================================
-- 
-- COLUMNS ADDED:
-- - github_url: GitHub repository URL
-- - deploy_url: Live demo/deployment URL  
-- - project_name: Name of the submitted project
-- - submission_file_url: Uploaded file URL (PDF, DOC, etc.)
-- - submission_description: Project description text
--
-- After running this, students can:
-- ✅ Upload files when submitting tasks
-- ✅ Provide GitHub repo links
-- ✅ Share live demo URLs
-- ✅ Add project descriptions
--
-- Admin will see:
-- ✅ "Download File" button for uploaded files
-- ✅ GitHub and Live Demo buttons
-- ✅ Project names and descriptions
--
-- ==========================================
