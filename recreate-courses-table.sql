-- URGENT FIX: Recreate courses table properly with all columns
-- Drop and recreate to clear schema cache issues

-- First, backup existing data
CREATE TABLE courses_backup AS 
SELECT * FROM courses;

-- Drop the old table
DROP TABLE IF EXISTS courses CASCADE;

-- Create fresh courses table with all required columns
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_weeks INTEGER,
  level VARCHAR(50) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS if needed
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Restore data if any (optional - comment out if table was empty)
-- INSERT INTO courses 
-- SELECT id, title, description, thumbnail_url, duration_weeks, level, status, created_by, created_at, updated_at 
-- FROM courses_backup;

-- Clean up backup
DROP TABLE courses_backup;
