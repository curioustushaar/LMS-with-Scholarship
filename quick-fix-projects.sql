-- Quick fix for projects table - Run this in Supabase SQL Editor

-- 1. Add deadline column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline TIMESTAMP;

-- 2. Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP POLICY IF EXISTS "Students can manage their own projects" ON projects;

-- 4. Create admin policy (full access)
CREATE POLICY "Admin full access to projects" 
ON projects FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- 5. Create student policy (own projects only)
CREATE POLICY "Students can manage their own projects" 
ON projects FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- 6. Reload schema
NOTIFY pgrst, 'reload schema';
