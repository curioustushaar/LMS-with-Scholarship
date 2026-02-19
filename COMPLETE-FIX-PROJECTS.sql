-- ==========================================
-- COMPLETE FIX FOR PROJECTS TABLE
-- ==========================================
-- This script fixes:
-- 1. Missing deadline column
-- 2. RLS policies for admin and student access
-- ==========================================

-- Step 1: Add deadline column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
    ALTER TABLE projects ADD COLUMN deadline TIMESTAMP;
    RAISE NOTICE '✅ Added deadline column to projects table';
  ELSE
    RAISE NOTICE 'ℹ️  deadline column already exists';
  END IF;
END $$;

-- Step 2: Enable RLS on projects table
DO $$
BEGIN
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✅ RLS enabled on projects table';
END $$;

-- Step 3: Drop existing policies if any (to avoid conflicts)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
  DROP POLICY IF EXISTS "Students can view their own projects" ON projects;
  DROP POLICY IF EXISTS "Students can manage their own projects" ON projects;
  DROP POLICY IF EXISTS "Students can view active projects" ON projects;
  RAISE NOTICE '✅ Dropped old policies';
END $$;

-- Step 4: Create Admin Policy - Full access to all projects
CREATE POLICY "Admin full access to projects" 
ON projects
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Step 5: Create Student Policy - Can only access their own projects
CREATE POLICY "Students can manage their own projects" 
ON projects
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);

-- Step 6: Verify policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'projects';
  
  RAISE NOTICE '📊 Total policies on projects table: %', policy_count;
END $$;

-- Step 7: Reload PostgREST schema cache
DO $$
BEGIN
  NOTIFY pgrst, 'reload schema';
  RAISE NOTICE '✅ Schema cache reloaded';
END $$;

-- Step 8: Display current policies
SELECT 
  '✅ Policy: ' || policyname as "Active Policies",
  'Command: ' || cmd as "Allowed Operations",
  'Role: ' || COALESCE(roles::text, 'authenticated') as "For Role"
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- Step 9: Verify columns
SELECT 
  '✅ Column: ' || column_name as "Projects Table Columns",
  'Type: ' || data_type as "Data Type",
  'Nullable: ' || is_nullable as "Can be NULL"
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- ==========================================
-- DONE! Projects table is now ready
-- ==========================================
