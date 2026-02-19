-- ==========================================
-- FIX ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Run this in Supabase SQL Editor to fix RLS errors

-- Disable RLS on tables that don't need it (or add policies)
-- Option 1: DISABLE RLS (Simpler, less secure but works for admin app)
ALTER TABLE IF EXISTS courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_deliverables DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS video_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_messages DISABLE ROW LEVEL SECURITY;

-- Keep users table RLS disabled (auth is handled by JWT)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- Alternative: If you want RLS policies instead
-- ==========================================
-- Uncomment below to enable RLS with policies

-- -- Enable RLS on courses
-- ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- 
-- -- Policy 1: Admins can do everything on courses
-- CREATE POLICY "Admins can manage courses" 
-- ON courses 
-- FOR ALL 
-- USING (
--   EXISTS (
--     SELECT 1 FROM users 
--     WHERE users.id = auth.uid() 
--     AND users.role = 'admin'
--   )
-- );
-- 
-- -- Policy 2: Students can only view active courses
-- CREATE POLICY "Students can view active courses" 
-- ON courses 
-- FOR SELECT 
-- USING (
--   status = 'active' 
--   OR created_by = auth.uid()
-- );
