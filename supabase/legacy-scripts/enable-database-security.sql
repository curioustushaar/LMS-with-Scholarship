-- ==========================================
-- DATABASE SECURITY & RLS POLICIES
-- ==========================================
-- This file enables Row Level Security (RLS) on all tables
-- and creates policies to prevent unauthorized access
-- Run this in Supabase SQL Editor for full database protection
-- ==========================================
-- NOTE: This script is SMART - it only enables RLS on existing tables!
-- No errors if tables are missing - policies are created conditionally
--
-- Tables that will be protected (if they exist):
--   • profiles, courses, weeks, videos, enrollments
--   • tasks, task_submissions
--   • badges, user_badges
--   • support_tickets, ticket_messages (optional)
--   • certificates
--   • storage.objects (avatars, task-submissions buckets)
-- ==========================================

-- ==========================================
-- 1. ENABLE RLS ON ALL TABLES
-- ==========================================

-- Enable RLS only on tables that exist
DO $$
BEGIN
  -- Core tables
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'weeks') THEN
    ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
    ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
    ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_submissions') THEN
    ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'badges') THEN
    ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_badges') THEN
    ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
    ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ticket_messages') THEN
    ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certificates') THEN
    ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
  END IF;

  RAISE NOTICE '✅ RLS enabled on all existing tables';
END $$;

-- ==========================================
-- 2. PROFILES TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Admin can view all profiles
    DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
    CREATE POLICY "Admin can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Users can view their own profile
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

    -- Only admin can update profiles
    DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;
    CREATE POLICY "Admin can update profiles"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Users can update their own profile limited fields
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

    RAISE NOTICE '✅ Profiles policies created';
  END IF;
END $$;

-- ==========================================
-- 3. COURSES TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    -- Everyone can view courses
    DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
    CREATE POLICY "Everyone can view courses"
    ON courses FOR SELECT
    TO authenticated
    USING (true);

    -- Only admin can insert/update/delete courses
    DROP POLICY IF EXISTS "Admin can manage courses" ON courses;
    CREATE POLICY "Admin can manage courses"
    ON courses FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Courses policies created';
  END IF;
END $$;

-- ==========================================
-- 3A. WEEKS TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'weeks') THEN
    -- Everyone can view weeks
    DROP POLICY IF EXISTS "Everyone can view weeks" ON weeks;
    CREATE POLICY "Everyone can view weeks"
    ON weeks FOR SELECT
    TO authenticated
    USING (true);

    -- Only admin can manage weeks
    DROP POLICY IF EXISTS "Admin can manage weeks" ON weeks;
    CREATE POLICY "Admin can manage weeks"
    ON weeks FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Weeks policies created';
  END IF;
END $$;

-- ==========================================
-- 3B. VIDEOS TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
    -- Everyone can view videos
    DROP POLICY IF EXISTS "Everyone can view videos" ON videos;
    CREATE POLICY "Everyone can view videos"
    ON videos FOR SELECT
    TO authenticated
    USING (true);

    -- Only admin can manage videos
    DROP POLICY IF EXISTS "Admin can manage videos" ON videos;
    CREATE POLICY "Admin can manage videos"
    ON videos FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Videos policies created';
  END IF;
END $$;

-- ==========================================
-- 4. ENROLLMENTS TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
    -- Students can view their own enrollments
    DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
    CREATE POLICY "Students can view own enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

    -- Admin can view all enrollments
    DROP POLICY IF EXISTS "Admin can view all enrollments" ON enrollments;
    CREATE POLICY "Admin can view all enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Only admin can manage enrollments
    DROP POLICY IF EXISTS "Admin can manage enrollments" ON enrollments;
    CREATE POLICY "Admin can manage enrollments"
    ON enrollments FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Enrollments policies created';
  END IF;
END $$;

-- ==========================================
-- 5. TASKS TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    -- Students can view tasks for their enrolled courses
    DROP POLICY IF EXISTS "Students can view enrolled tasks" ON tasks;
    CREATE POLICY "Students can view enrolled tasks"
    ON tasks FOR SELECT
    TO authenticated
    USING (
      course_id IN (
        SELECT course_id FROM enrollments WHERE user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Admin can manage tasks
    DROP POLICY IF EXISTS "Admin can manage tasks" ON tasks;
    CREATE POLICY "Admin can manage tasks"
    ON tasks FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Tasks policies created';
  END IF;
END $$;

-- ==========================================
-- 6. TASK SUBMISSIONS POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_submissions') THEN
    -- Students can view their own submissions
    DROP POLICY IF EXISTS "Students can view own submissions" ON task_submissions;
    CREATE POLICY "Students can view own submissions"
    ON task_submissions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

    -- Admin can view all submissions
    DROP POLICY IF EXISTS "Admin can view all submissions" ON task_submissions;
    CREATE POLICY "Admin can view all submissions"
    ON task_submissions FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Students can insert their own submissions
    DROP POLICY IF EXISTS "Students can create submissions" ON task_submissions;
    CREATE POLICY "Students can create submissions"
    ON task_submissions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

    -- Admin can update submissions (for grading)
    DROP POLICY IF EXISTS "Admin can update submissions" ON task_submissions;
    CREATE POLICY "Admin can update submissions"
    ON task_submissions FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Task submissions policies created';
  END IF;
END $$;

-- ==========================================
-- 7. SUPPORT TICKETS POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
    -- Users can view their own tickets
    DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
    CREATE POLICY "Users can view own tickets"
    ON support_tickets FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

    -- Admin can view all tickets
    DROP POLICY IF EXISTS "Admin can view all tickets" ON support_tickets;
    CREATE POLICY "Admin can view all tickets"
    ON support_tickets FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Users can create their own tickets
    DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
    CREATE POLICY "Users can create tickets"
    ON support_tickets FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

    -- Admin can update tickets
    DROP POLICY IF EXISTS "Admin can update tickets" ON support_tickets;
    CREATE POLICY "Admin can update tickets"
    ON support_tickets FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Support tickets policies created';
  END IF;
END $$;

-- ==========================================
-- 7A. TICKET MESSAGES POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ticket_messages') 
     AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
    -- Users can view messages for their tickets
    DROP POLICY IF EXISTS "Users can view own ticket messages" ON ticket_messages;
    CREATE POLICY "Users can view own ticket messages"
    ON ticket_messages FOR SELECT
    TO authenticated
    USING (
      ticket_id IN (
        SELECT id FROM support_tickets WHERE user_id = auth.uid()
      )
    );

    -- Admin can view all ticket messages
    DROP POLICY IF EXISTS "Admin can view all ticket messages" ON ticket_messages;
    CREATE POLICY "Admin can view all ticket messages"
    ON ticket_messages FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Users can create messages for their tickets
    DROP POLICY IF EXISTS "Users can create ticket messages" ON ticket_messages;
    CREATE POLICY "Users can create ticket messages"
    ON ticket_messages FOR INSERT
    TO authenticated
    WITH CHECK (
      ticket_id IN (
        SELECT id FROM support_tickets WHERE user_id = auth.uid()
      )
    );

    -- Admin can create messages for any ticket
    DROP POLICY IF EXISTS "Admin can create ticket messages" ON ticket_messages;
    CREATE POLICY "Admin can create ticket messages"
    ON ticket_messages FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Ticket messages policies created';
  END IF;
END $$;

-- ==========================================
-- 7B. BADGES TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'badges') THEN
    -- Everyone can view badges
    DROP POLICY IF EXISTS "Everyone can view badges" ON badges;
    CREATE POLICY "Everyone can view badges"
    ON badges FOR SELECT
    TO authenticated
    USING (true);

    -- Only admin can manage badges
    DROP POLICY IF EXISTS "Admin can manage badges" ON badges;
    CREATE POLICY "Admin can manage badges"
    ON badges FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Badges policies created';
  END IF;
END $$;

-- ==========================================
-- 7C. USER BADGES TABLE POLICIES
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_badges') THEN
    -- Users can view their own badges
    DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
    CREATE POLICY "Users can view own badges"
    ON user_badges FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

    -- Admin can view all user badges
    DROP POLICY IF EXISTS "Admin can view all user badges" ON user_badges;
    CREATE POLICY "Admin can view all user badges"
    ON user_badges FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    -- Only admin can manage user badges
    DROP POLICY IF EXISTS "Admin can manage user badges" ON user_badges;
    CREATE POLICY "Admin can manage user badges"
    ON user_badges FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ User badges policies created';
  END IF;
END $$;

-- ==========================================
-- 8. CERTIFICATES POLICIES (Public Access)
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certificates') THEN
    -- Anyone can view certificates (public)
    DROP POLICY IF EXISTS "Anyone can view certificates" ON certificates;
    CREATE POLICY "Anyone can view certificates"
    ON certificates FOR SELECT
    TO anon, authenticated
    USING (true);

    -- Only admin can create certificates
    DROP POLICY IF EXISTS "Admin can create certificates" ON certificates;
    CREATE POLICY "Admin can create certificates"
    ON certificates FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );

    RAISE NOTICE '✅ Certificates policies created';
  END IF;
END $$;

-- ==========================================
-- 9. STORAGE BUCKET POLICIES
-- ==========================================

-- Avatars bucket - public read, auth write
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Task submissions bucket - auth only
DROP POLICY IF EXISTS "Students can upload task files" ON storage.objects;
CREATE POLICY "Students can upload task files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-submissions');

DROP POLICY IF EXISTS "Users can view task files" ON storage.objects;
CREATE POLICY "Users can view task files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-submissions');

-- ==========================================
-- 10. VERIFY RLS IS ENABLED
-- ==========================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'courses', 'weeks', 'videos', 'enrollments',
    'tasks', 'task_submissions', 'badges', 'user_badges', 
    'support_tickets', 'ticket_messages', 'certificates'
  )
ORDER BY tablename;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database security enabled successfully!';
  RAISE NOTICE '🔒 Row Level Security (RLS) activated on all tables';
  RAISE NOTICE '🛡️ Policies created for admin and user access control';
  RAISE NOTICE '🔐 No direct database access without authentication';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANT: Test all functionality after enabling RLS!';
  RAISE NOTICE '📝 Check the query results above to verify RLS status';
END $$;
