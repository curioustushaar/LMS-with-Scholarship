-- Fix RLS (Row Level Security) for LMS Admin System
-- This enables security policies for all tables
-- Date: 2026-02-11

-- ==========================================
-- ENABLE RLS ON ALL TABLES
-- ==========================================

-- Enable RLS on tables that exist
DO $$ 
BEGIN
    -- Core tables that should exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weeks') THEN
        ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos') THEN
        ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
        ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Optional tables - only enable if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') THEN
        ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates') THEN
        ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badges') THEN
        ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on supporting tables if they exist
DO $$ 
BEGIN
    -- Check and enable RLS for additional tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'milestones') THEN
        ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ==========================================
-- DROP EXISTING POLICIES (Clean slate) - Only for existing tables
-- ==========================================

DO $$ 
BEGIN
    -- Users table policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP POLICY IF EXISTS "Admin full access to users" ON users;
        DROP POLICY IF EXISTS "Students can view their own profile" ON users;
        DROP POLICY IF EXISTS "Students can update their own profile" ON users;
    END IF;

    -- Courses table policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        DROP POLICY IF EXISTS "Admin full access to courses" ON courses;
        DROP POLICY IF EXISTS "Students can view active courses" ON courses;
    END IF;

    -- Enrollments table policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        DROP POLICY IF EXISTS "Admin full access to enrollments" ON enrollments;
        DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
    END IF;

    -- Videos table policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos') THEN
        DROP POLICY IF EXISTS "Admin full access to videos" ON videos;
        DROP POLICY IF EXISTS "Students can view videos of enrolled courses" ON videos;
    END IF;
    
    -- Other table policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weeks') THEN
        DROP POLICY IF EXISTS "Admin full access to weeks" ON weeks;
        DROP POLICY IF EXISTS "Students can view weeks of enrolled courses" ON weeks;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
        DROP POLICY IF EXISTS "Admin full access to video_progress" ON video_progress;
        DROP POLICY IF EXISTS "Students manage their own video progress" ON video_progress;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        DROP POLICY IF EXISTS "Admin full access to tasks" ON tasks;
        DROP POLICY IF EXISTS "Students can view tasks of enrolled courses" ON tasks;
    END IF;
    
    -- Optional tables policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') THEN
        DROP POLICY IF EXISTS "Admin full access to submissions" ON submissions;
        DROP POLICY IF EXISTS "Students manage their own submissions" ON submissions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
        DROP POLICY IF EXISTS "Students can view active projects" ON projects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates') THEN
        DROP POLICY IF EXISTS "Admin full access to certificates" ON certificates;
        DROP POLICY IF EXISTS "Students can view their own certificates" ON certificates;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badges') THEN
        DROP POLICY IF EXISTS "Admin full access to badges" ON badges;
        DROP POLICY IF EXISTS "Students can view all badges" ON badges;
    END IF;
    
    -- Additional support tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
        DROP POLICY IF EXISTS "Students can manage their own profile" ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP POLICY IF EXISTS "Admin full access to payments" ON payments;
        DROP POLICY IF EXISTS "Students can view their own payments" ON payments;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'milestones') THEN
        DROP POLICY IF EXISTS "Admin full access to milestones" ON milestones;
        DROP POLICY IF EXISTS "Students can view milestones" ON milestones;
    END IF;
END $$;

-- ==========================================
-- CREATE RLS POLICIES FOR ADMIN ACCESS
-- ==========================================

-- USERS TABLE - Admin can do everything, students can view/update their own data
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        EXECUTE 'CREATE POLICY "Admin full access to users" ON users
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';

        EXECUTE 'CREATE POLICY "Students can view their own profile" ON users
        FOR SELECT USING (auth.uid() = id)';

        EXECUTE 'CREATE POLICY "Students can update their own profile" ON users
        FOR UPDATE USING (auth.uid() = id)';
    END IF;
END $$;

-- COURSES TABLE - Admin manages, students view active courses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        EXECUTE 'CREATE POLICY "Admin full access to courses" ON courses
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';

        EXECUTE 'CREATE POLICY "Students can view active courses" ON courses
        FOR SELECT USING (status = ''active'')';
    END IF;
END $$;

-- ENROLLMENTS TABLE - Admin manages, students see their own
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        EXECUTE 'CREATE POLICY "Admin full access to enrollments" ON enrollments
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';

        EXECUTE 'CREATE POLICY "Students can view their own enrollments" ON enrollments
        FOR SELECT USING (auth.uid() = user_id)';
    END IF;
END $$;

-- WEEKS TABLE - Admin manages, students view weeks of enrolled courses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weeks') THEN
        EXECUTE 'CREATE POLICY "Admin full access to weeks" ON weeks
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';

        EXECUTE 'CREATE POLICY "Students can view weeks of enrolled courses" ON weeks
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM enrollments e 
                WHERE e.user_id = auth.uid() 
                AND e.course_id = weeks.course_id
            )
        )';
    END IF;
END $$;

-- VIDEOS TABLE - Admin manages, students view videos of enrolled courses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos') THEN
        EXECUTE 'CREATE POLICY "Admin full access to videos" ON videos
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';

        EXECUTE 'CREATE POLICY "Students can view videos of enrolled courses" ON videos
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM enrollments e 
                JOIN weeks w ON w.course_id = e.course_id
                WHERE e.user_id = auth.uid() 
                AND w.id = videos.week_id
            )
        )';
    END IF;
END $$;

-- VIDEO_PROGRESS TABLE - Admin views all, students manage their own
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
        EXECUTE 'CREATE POLICY "Admin full access to video_progress" ON video_progress
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';

        EXECUTE 'CREATE POLICY "Students manage their own video progress" ON video_progress
        FOR ALL USING (auth.uid() = user_id)';
    END IF;
END $$;

-- TASKS TABLE - Admin manages, students view tasks of enrolled courses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        EXECUTE 'CREATE POLICY "Admin full access to tasks" ON tasks
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';

        EXECUTE 'CREATE POLICY "Students can view tasks of enrolled courses" ON tasks
        FOR SELECT USING (
            course_id IS NULL OR
            EXISTS (
                SELECT 1 FROM enrollments e 
                WHERE e.user_id = auth.uid() 
                AND e.course_id = tasks.course_id
            )
        )';
    END IF;
END $$;

-- SUBMISSIONS TABLE (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') THEN
        -- Admin manages all, students manage their own
        EXECUTE 'CREATE POLICY "Admin full access to submissions" ON submissions
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';
        
        EXECUTE 'CREATE POLICY "Students manage their own submissions" ON submissions
        FOR ALL USING (auth.uid() = user_id)';
    END IF;
END $$;

-- PROJECTS TABLE (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        EXECUTE 'CREATE POLICY "Admin full access to projects" ON projects
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';
        
        EXECUTE 'CREATE POLICY "Students can view active projects" ON projects
        FOR SELECT USING (status = ''active'')';
    END IF;
END $$;

-- CERTIFICATES TABLE (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates') THEN
        EXECUTE 'CREATE POLICY "Admin full access to certificates" ON certificates
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';
        
        EXECUTE 'CREATE POLICY "Students can view their own certificates" ON certificates
        FOR SELECT USING (auth.uid() = user_id)';
    END IF;
END $$;

-- BADGES TABLE (if exists)  
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badges') THEN
        EXECUTE 'CREATE POLICY "Admin full access to badges" ON badges
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id = auth.uid() 
                AND u.role = ''admin''
            )
        )';
        
        EXECUTE 'CREATE POLICY "Students can view all badges" ON badges
        FOR SELECT USING (true)';
    END IF;
END $$;

-- ==========================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ==========================================

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check RLS status for all tables
SELECT schemaname, tablename, rowsecurity as rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'courses', 'enrollments', 'weeks', 'videos', 'video_progress', 'tasks')
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;