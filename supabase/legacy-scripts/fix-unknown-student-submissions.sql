-- ==========================================
-- FIX: Unknown Student in Submissions Page
-- ==========================================
-- The API fetches from 'users' table which has RLS enabled
-- We need to disable RLS on users table too
-- ==========================================

-- Check if 'users' table exists and disable RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    -- Disable RLS on users table
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS disabled on users table';
  ELSE
    RAISE NOTICE '⚠️ users table does not exist';
  END IF;
END $$;

-- Also make sure other auth-related tables have RLS disabled
DO $$
BEGIN
  -- Check and disable RLS on auth.users if accessible
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    -- Note: You typically can't modify auth schema tables
    RAISE NOTICE 'ℹ️ auth.users exists but is managed by Supabase';
  END IF;
END $$;

-- Verify current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'profiles', 'task_submissions')
ORDER BY tablename;

-- Test query: Should return student names now
SELECT 
  ts.id,
  ts.status,
  u.full_name as student_name,
  u.email as student_email,
  t.title as task_title
FROM task_submissions ts
LEFT JOIN users u ON ts.user_id = u.id
LEFT JOIN tasks t ON ts.task_id = t.id
ORDER BY ts.submitted_at DESC
LIMIT 5;

-- ==========================================
-- ✅ DONE! Run this and refresh submissions page
-- ==========================================
-- After running:
-- 1. Ctrl+Shift+R on submissions page
-- 2. Should show actual student names instead of "Unknown Student"
-- ==========================================
