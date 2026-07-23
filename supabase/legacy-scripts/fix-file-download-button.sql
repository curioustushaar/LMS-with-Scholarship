-- ==========================================
-- FIX: Show Download Button for File Uploads
-- ==========================================
-- The column exists but may have NULL values
-- This checks data and ensures everything is set up correctly
-- ==========================================

-- 1. Check which submissions have file_url data
SELECT 
  id,
  project_name,
  submission_url,
  file_url,
  submission_file_url,
  status,
  submitted_at
FROM task_submissions
WHERE file_url IS NOT NULL 
   OR submission_file_url IS NOT NULL
ORDER BY submitted_at DESC;

-- 2. If you have data in 'file_url' column, copy it to 'submission_file_url'
UPDATE task_submissions
SET submission_file_url = file_url
WHERE file_url IS NOT NULL 
  AND (submission_file_url IS NULL OR submission_file_url = '');

-- 3. Verify the update worked
SELECT 
  id,
  project_name,
  submission_file_url,
  status,
  submitted_at
FROM task_submissions
WHERE submission_file_url IS NOT NULL
ORDER BY submitted_at DESC;

-- ==========================================
-- ✅ VERIFICATION COMPLETE
-- ==========================================
-- 
-- After running this:
-- 1. Refresh admin submissions page
-- 2. You should see purple "Download File" button
-- 3. Button appears next to GitHub and Live Demo buttons
--
-- If no buttons appear, it means no submissions have uploaded files yet.
-- Have a student submit a task with a file to test!
--
-- ==========================================
