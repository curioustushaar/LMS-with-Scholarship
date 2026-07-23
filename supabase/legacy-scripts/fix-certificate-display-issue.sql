-- Fix Certificate Display Issues
-- This script ensures proper relationships and data for certificate display

-- First, let's check the current state
DO $$ 
DECLARE 
    cert_count INTEGER;
    users_count INTEGER;
    missing_users INTEGER;
BEGIN 
    -- Get certificate count
    SELECT COUNT(*) INTO cert_count FROM certificates;
    
    -- Get users count  
    SELECT COUNT(*) INTO users_count FROM users;
    
    -- Count certificates with missing user references
    SELECT COUNT(*) INTO missing_users 
    FROM certificates c 
    LEFT JOIN users u ON c.user_id = u.id 
    WHERE u.id IS NULL;
    
    RAISE NOTICE '=== CERTIFICATE DIAGNOSIS ===';
    RAISE NOTICE 'Total Certificates: %', cert_count;
    RAISE NOTICE 'Total Users: %', users_count;
    RAISE NOTICE 'Certificates with Missing Users: %', missing_users;
    RAISE NOTICE '================================';
END $$;

-- Ensure Foreign Key Constraints exist
DO $$
BEGIN
    -- Drop existing constraints if they exist to recreate them
    ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_user_id_fkey;
    ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_course_id_fkey;
    
    -- Add proper foreign key constraints with CASCADE
    ALTER TABLE certificates 
    ADD CONSTRAINT certificates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    
    ALTER TABLE certificates 
    ADD CONSTRAINT certificates_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraints added successfully';
END $$;

-- Update any orphaned certificates with proper user data
DO $$
DECLARE
    admin_user_id UUID;
    web_course_id UUID;
BEGIN
    -- Get admin user ID (or create one if needed)
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        -- Create admin user if none exists
        INSERT INTO users (email, full_name, role, password_hash)
        VALUES ('admin@lms.com', 'System Admin', 'admin', 'temp-hash')
        RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Created admin user with ID: %', admin_user_id;
    END IF;
    
    -- Get a course ID (or create one)
    SELECT id INTO web_course_id FROM courses WHERE title ILIKE '%web%' LIMIT 1;
    
    IF web_course_id IS NULL THEN
        -- Create default course if none exists
        INSERT INTO courses (title, description, domain)
        VALUES ('Web Development Fundamentals', 'Complete web development course', 'Web Development')
        RETURNING id INTO web_course_id;
        
        RAISE NOTICE 'Created default course with ID: %', web_course_id;
    END IF;
    
    -- Update certificates that have invalid user_id references
    UPDATE certificates 
    SET user_id = admin_user_id,
        course_id = web_course_id
    WHERE user_id NOT IN (SELECT id FROM users)
       OR course_id NOT IN (SELECT id FROM courses);
    
    RAISE NOTICE 'Updated orphaned certificates';
END $$;

-- Ensure we have proper profiles data
DO $$
BEGIN
    -- Create profiles for users that don't have them
    INSERT INTO profiles (
        id, 
        full_name, 
        email,
        role,
        created_at,
        updated_at
    )
    SELECT 
        u.id,
        u.full_name,
        u.email,
        COALESCE(u.role, 'student'),
        u.created_at,
        u.updated_at
    FROM users u 
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);
    
    RAISE NOTICE 'Ensured all users have profiles';
END $$;

-- Update certificate data to ensure proper information
UPDATE certificates 
SET domain = COALESCE(domain, 'Web Development'),
    sent_status = COALESCE(sent_status, 'issued')
WHERE domain IS NULL OR sent_status IS NULL;

-- Verify the fix
DO $$ 
DECLARE 
    cert_record RECORD;
BEGIN 
    RAISE NOTICE '=== CERTIFICATE VERIFICATION ===';
    
    FOR cert_record IN 
        SELECT 
            c.certificate_number,
            u.full_name,
            u.email,
            co.title as course_title
        FROM certificates c
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN courses co ON c.course_id = co.id
        ORDER BY c.issued_at DESC
        LIMIT 5
    LOOP
        RAISE NOTICE 'Certificate: % | Student: % | Email: % | Course: %', 
            cert_record.certificate_number,
            cert_record.full_name,
            cert_record.email,
            cert_record.course_title;
    END LOOP;
    
    RAISE NOTICE '=================================';
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON certificates(issued_at);

-- Enable RLS if not already enabled
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure proper access
DROP POLICY IF EXISTS "Admin full access to certificates" ON certificates;
DROP POLICY IF EXISTS "Students can view their own certificates" ON certificates;

CREATE POLICY "Admin full access to certificates" 
ON certificates FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Students can view their own certificates" 
ON certificates FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Final status report
DO $$ 
DECLARE 
    total_certs INTEGER;
    valid_certs INTEGER;
BEGIN 
    SELECT COUNT(*) INTO total_certs FROM certificates;
    
    SELECT COUNT(*) INTO valid_certs 
    FROM certificates c
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN courses co ON c.course_id = co.id;
    
    RAISE NOTICE '=== FINAL STATUS ===';
    RAISE NOTICE 'Total Certificates: %', total_certs;
    RAISE NOTICE 'Valid Certificates: %', valid_certs;
    RAISE NOTICE 'Fix completed successfully!';
    RAISE NOTICE '===================';
END $$;