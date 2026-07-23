-- ============================================
-- 🔧 COMPLETE FIX - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- Yeh script sab kuch fix kar dega:
-- 1. Admin role setup
-- 2. Enrollments table
-- 3. Domain support for tasks
-- 4. All indexes and functions
-- ============================================

-- ============================================
-- STEP 1: FIX ADMIN ROLE (Replace email with yours!)
-- ============================================
DO $$
BEGIN
  -- Check if admin exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
    -- Create admin user (CHANGE EMAIL AND NAME!)
    INSERT INTO users (email, full_name, role, status)
    VALUES ('admin@lms.com', 'Admin User', 'admin', 'active')
    ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'active';
    RAISE NOTICE '✅ Admin user created/updated';
  ELSE
    RAISE NOTICE '✅ Admin user already exists';
  END IF;
END $$;

-- Update existing user to admin (CHANGE EMAIL!)
-- Uncomment and replace with your email:
-- UPDATE users SET role = 'admin', status = 'active' WHERE email = 'your-email@example.com';

-- ============================================
-- STEP 2: CREATE ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Add indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

RAISE NOTICE '✅ Enrollments table created with indexes';

-- ============================================
-- STEP 3: ADD DOMAIN COLUMNS
-- ============================================

-- Add domain to courses
ALTER TABLE IF EXISTS public.courses
  ADD COLUMN IF NOT EXISTS domain VARCHAR(128);

-- Add domain to users (students)
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS domain VARCHAR(128);

-- Add domain to tasks
ALTER TABLE IF EXISTS public.tasks
  ADD COLUMN IF NOT EXISTS domain VARCHAR(128);

-- Add enrolled_course_ids to users
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS enrolled_course_ids UUID[] DEFAULT '{}';

RAISE NOTICE '✅ Domain columns added to all tables';

-- ============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Domain indexes
CREATE INDEX IF NOT EXISTS idx_courses_domain ON public.courses(domain);
CREATE INDEX IF NOT EXISTS idx_users_domain ON public.users(domain);
CREATE INDEX IF NOT EXISTS idx_tasks_domain ON public.tasks(domain);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON public.tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Submission indexes
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_enrolled_course_ids ON users USING GIN(enrolled_course_ids);

RAISE NOTICE '✅ All indexes created';

-- ============================================
-- STEP 5: CREATE SYNC FUNCTION FOR ENROLLMENTS
-- ============================================
CREATE OR REPLACE FUNCTION sync_user_enrolled_courses()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT (new enrollment)
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET enrolled_course_ids = array_append(
      COALESCE(enrolled_course_ids, '{}'), 
      NEW.course_id
    )
    WHERE id = NEW.user_id
    AND NOT (COALESCE(enrolled_course_ids, '{}') @> ARRAY[NEW.course_id]);
    
    RETURN NEW;
  END IF;
  
  -- For DELETE (enrollment removed)  
  IF TG_OP = 'DELETE' THEN
    UPDATE users 
    SET enrolled_course_ids = array_remove(
      COALESCE(enrolled_course_ids, '{}'), 
      OLD.course_id
    )
    WHERE id = OLD.user_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_user_enrolled_courses ON enrollments;
CREATE TRIGGER trigger_sync_user_enrolled_courses
  AFTER INSERT OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION sync_user_enrolled_courses();

RAISE NOTICE '✅ Enrollment sync function and trigger created';

-- ============================================
-- STEP 6: UPDATE EXISTING DATA
-- ============================================

-- Sync existing enrollments to users.enrolled_course_ids
UPDATE users 
SET enrolled_course_ids = (
  SELECT COALESCE(array_agg(e.course_id), '{}')
  FROM enrollments e 
  WHERE e.user_id = users.id
)
WHERE EXISTS (SELECT 1 FROM enrollments WHERE user_id = users.id);

-- Update task domains from courses
UPDATE tasks t
SET domain = c.domain
FROM courses c
WHERE t.course_id = c.id
  AND t.domain IS NULL
  AND c.domain IS NOT NULL;

RAISE NOTICE '✅ Existing data synced';

-- ============================================
-- STEP 7: CREATE HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_student_tasks(
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL,
  p_status VARCHAR DEFAULT 'active'
)
RETURNS TABLE (
  task_id UUID,
  task_title VARCHAR,
  task_description TEXT,
  task_deadline TIMESTAMP,
  task_max_points INTEGER,
  course_title VARCHAR,
  course_domain VARCHAR,
  submission_id UUID,
  submission_status VARCHAR,
  submission_points INTEGER,
  submission_submitted_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as task_id,
    t.title as task_title,
    t.description as task_description,
    t.deadline as task_deadline,
    t.max_points as task_max_points,
    c.title as course_title,
    c.domain as course_domain,
    ts.id as submission_id,
    ts.status as submission_status,
    ts.points_awarded as submission_points,
    ts.submitted_at as submission_submitted_at
  FROM tasks t
  INNER JOIN courses c ON t.course_id = c.id
  INNER JOIN enrollments e ON e.course_id = c.id AND e.user_id = p_user_id
  LEFT JOIN task_submissions ts ON ts.task_id = t.id AND ts.user_id = p_user_id
  WHERE t.status = p_status
    AND (p_course_id IS NULL OR t.course_id = p_course_id)
  ORDER BY t.deadline ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE '✅ Helper function created';

-- ============================================
-- STEP 8: VERIFICATION
-- ============================================

-- Show summary
DO $$
DECLARE
  admin_count INTEGER;
  course_count INTEGER;
  task_count INTEGER;
  enrollment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
  SELECT COUNT(*) INTO course_count FROM courses;
  SELECT COUNT(*) INTO task_count FROM tasks;
  SELECT COUNT(*) INTO enrollment_count FROM enrollments;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin users: %', admin_count;
  RAISE NOTICE 'Total courses: %', course_count;
  RAISE NOTICE 'Total tasks: %', task_count;
  RAISE NOTICE 'Total enrollments: %', enrollment_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📝 NEXT STEPS:';
  RAISE NOTICE '1. Set course domains: UPDATE courses SET domain = ''Web Development'' WHERE title ILIKE ''%%web%%'';';
  RAISE NOTICE '2. Set student domains: UPDATE users SET domain = ''Web Development'' WHERE role = ''student'';';
  RAISE NOTICE '3. Enroll students: INSERT INTO enrollments (user_id, course_id) VALUES (''student-uuid'', ''course-uuid'');';
  RAISE NOTICE '';
END $$;

-- Show current state
SELECT 
  'Admin Users' as item,
  COUNT(*)::text as count
FROM users WHERE role = 'admin'
UNION ALL
SELECT 
  'Courses with Domain',
  COUNT(*)::text
FROM courses WHERE domain IS NOT NULL
UNION ALL
SELECT 
  'Tasks with Domain',
  COUNT(*)::text
FROM tasks WHERE domain IS NOT NULL
UNION ALL
SELECT 
  'Total Enrollments',
  COUNT(*)::text
FROM enrollments;
