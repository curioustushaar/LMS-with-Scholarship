-- Fix RLS policies for projects table

-- Step 1: Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if any
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP POLICY IF EXISTS "Students can view their own projects" ON projects;
DROP POLICY IF EXISTS "Students can manage their own projects" ON projects;

-- Step 3: Create policy for Admin - Full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admin full access to projects" ON projects
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Step 4: Create policy for Students - Can only see and manage their own projects
CREATE POLICY "Students can manage their own projects" ON projects
FOR ALL 
USING (auth.uid() = user_id);

-- Step 5: Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'projects';

-- Step 6: Reload schema cache
NOTIFY pgrst, 'reload schema';
