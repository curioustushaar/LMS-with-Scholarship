-- Fix Student Access to Enrollments
-- Run this in Supabase SQL Editor to ensure students can see their enrolled courses

-- 1. Ensure enrollments table exists with correct structure
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- 3. Enable RLS on enrollments table
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (if any)
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admin full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Service role full access to enrollments" ON enrollments;

-- 5. Create policy for students to view their own enrollments
CREATE POLICY "Students can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 6. Create policy for admins to manage all enrollments
CREATE POLICY "Admin full access to enrollments"
ON enrollments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 7. Create policy for service role (backend operations)
CREATE POLICY "Service role full access to enrollments"
ON enrollments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Verify the setup
SELECT 
  'Table exists' as check_type,
  COUNT(*) as count 
FROM information_schema.tables 
WHERE table_name = 'enrollments';

SELECT 
  'Policies created' as check_type,
  COUNT(*) as count 
FROM pg_policies 
WHERE tablename = 'enrollments';

-- 9. Check sample enrollments (if any)
SELECT 
  e.id,
  u.email as student_email,
  c.title as course_title,
  e.enrolled_at
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC
LIMIT 10;

-- Success message
SELECT '✅ Student enrollment access has been configured!' as status;
