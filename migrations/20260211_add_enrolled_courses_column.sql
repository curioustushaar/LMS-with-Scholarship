-- Migration: Add enrolled_course_ids column to users table
-- This will store an array of course IDs that the user is enrolled in
-- Date: 2026-02-11

-- Add enrolled_course_ids column to users table
DO $$
BEGIN
  -- Check if column doesn't exist, then add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'enrolled_course_ids') THEN
    ALTER TABLE users ADD COLUMN enrolled_course_ids UUID[] DEFAULT '{}';
    RAISE NOTICE 'Added enrolled_course_ids column to users table';
  ELSE
    RAISE NOTICE 'enrolled_course_ids column already exists in users table';
  END IF;
END $$;

-- Create index for efficient searching
CREATE INDEX IF NOT EXISTS idx_users_enrolled_course_ids ON users USING GIN(enrolled_course_ids);

-- Function to automatically update enrolled_course_ids when enrollments change
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

-- Create trigger to automatically sync enrollments with users table
DROP TRIGGER IF EXISTS trigger_sync_user_enrolled_courses ON enrollments;
CREATE TRIGGER trigger_sync_user_enrolled_courses
  AFTER INSERT OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION sync_user_enrolled_courses();

-- Populate existing data: sync current enrollments to users table
UPDATE users 
SET enrolled_course_ids = (
  SELECT COALESCE(array_agg(e.course_id), '{}')
  FROM enrollments e 
  WHERE e.user_id = users.id
);

-- Verify the migration
SELECT 
  id, 
  email, 
  full_name, 
  enrolled_course_ids,
  array_length(enrolled_course_ids, 1) as total_courses
FROM users 
WHERE enrolled_course_ids IS NOT NULL AND array_length(enrolled_course_ids, 1) > 0
LIMIT 5;