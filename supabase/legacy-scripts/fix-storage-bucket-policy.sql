-- ==========================================
-- FIX: Supabase Storage for Project Deliverables
-- ==========================================
-- Run this in your Supabase SQL Editor to fix "Bucket not found" errors.

-- 1. Create the storage bucket if it doesn't exist
-- This bucket will hold all files uploaded by students for their projects.
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-deliverables', 'project-deliverables', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Create a public access policy for the bucket
-- This allows anyone with the link to view the files, which is necessary
-- for admins to open them from the dashboard.

-- Drop the policy if it already exists to avoid errors
DROP POLICY IF EXISTS "Public access for project deliverables" ON storage.objects;

-- Create the policy
CREATE POLICY "Public access for project deliverables"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-deliverables' );

-- 3. Enable RLS on the table that stores file metadata
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

-- 4. Ensure admins have full access to the file metadata
DROP POLICY IF EXISTS "Admin full access to project_deliverables" ON project_deliverables;
CREATE POLICY "Admin full access to project_deliverables"
ON project_deliverables FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 5. Allow students to insert their own deliverables
DROP POLICY IF EXISTS "Students can insert their own deliverables" ON project_deliverables;
CREATE POLICY "Students can insert their own deliverables"
ON project_deliverables FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = (
  SELECT user_id FROM projects WHERE id = project_id
));

-- 6. Allow students to view their own deliverables
DROP POLICY IF EXISTS "Students can view their own deliverables" ON project_deliverables;
CREATE POLICY "Students can view their own deliverables"
ON project_deliverables FOR SELECT
TO authenticated
USING (auth.uid() = (
  SELECT user_id FROM projects WHERE id = project_id
));

-- After running this, new file uploads will be stored correctly and
-- existing files should become accessible.
