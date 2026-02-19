-- ==========================================
-- CREATE PROJECT DELIVERABLES STORAGE BUCKET
-- ==========================================
-- This creates a public storage bucket for student project file uploads
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Create the bucket (public so files can be downloaded)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'project-deliverables',
  'project-deliverables',
  true,
  104857600 -- 100MB limit (larger for project files)
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 104857600;

-- 2. Allow public read access (so anyone can download files)
DROP POLICY IF EXISTS "Public can read project deliverables" ON storage.objects;
CREATE POLICY "Public can read project deliverables"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-deliverables');

-- 3. Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload project deliverables" ON storage.objects;
CREATE POLICY "Authenticated users can upload project deliverables"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-deliverables');

-- 4. Allow users to update their own files
DROP POLICY IF EXISTS "Users can update own project deliverables" ON storage.objects;
CREATE POLICY "Users can update own project deliverables"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-deliverables')
WITH CHECK (bucket_id = 'project-deliverables');

-- 5. Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own project deliverables" ON storage.objects;
CREATE POLICY "Users can delete own project deliverables"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-deliverables');

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
WHERE id = 'project-deliverables';

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
  AND policyname LIKE '%project deliverables%';

-- ==========================================
-- ✅ BUCKET SETUP COMPLETE
-- ==========================================
-- 
-- WHAT WAS CREATED:
-- ✅ project-deliverables bucket (public, 100MB limit)
-- ✅ Public read policy (anyone can download)
-- ✅ Authenticated upload policy (students can upload)
-- ✅ Allowed file types: All common project files (PDF, DOC, ZIP, Images, Code files, etc.)
--
-- NEXT STEPS:
-- 1. Restart dev server if needed
-- 2. Student submits project with files
-- 3. Admin clicks file links in Projects page
-- 4. Files should open/download successfully!
--
-- ==========================================
