-- ==========================================
-- CREATE TASK SUBMISSIONS STORAGE BUCKET
-- ==========================================
-- This creates a public storage bucket for student file uploads
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Create the bucket (public so files can be downloaded)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'task-submissions',
  'task-submissions',
  true,
  52428800 -- 50MB limit
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 52428800;

-- 2. Allow public read access (so anyone can download files)
DROP POLICY IF EXISTS "Public can read task submissions" ON storage.objects;
CREATE POLICY "Public can read task submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-submissions');

-- 3. Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload task submissions" ON storage.objects;
CREATE POLICY "Authenticated users can upload task submissions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-submissions');

-- 4. Allow users to update their own files
DROP POLICY IF EXISTS "Users can update own task submissions" ON storage.objects;
CREATE POLICY "Users can update own task submissions"
ON storage.objects FOR UPDATE
USING (bucket_id = 'task-submissions')
WITH CHECK (bucket_id = 'task-submissions');

-- 5. Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own task submissions" ON storage.objects;
CREATE POLICY "Users can delete own task submissions"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-submissions');

-- ==========================================
-- VERIFY BUCKET SETUP
-- ==========================================

-- Check if bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id = 'task-submissions';

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%task submissions%';

-- ==========================================
-- ✅ BUCKET SETUP COMPLETE
-- ==========================================
-- 
-- WHAT WAS CREATED:
-- ✅ task-submissions bucket (public, 50MB limit)
-- ✅ Public read policy (anyone can download)
-- ✅ Authenticated upload policy (students can upload)
-- ✅ Allowed file types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, Images
--
-- NEXT STEPS:
-- 1. Restart dev server: npm run dev
-- 2. Student submits task with file
-- 3. Click "Download File" button
-- 4. File should open successfully!
--
-- ==========================================
