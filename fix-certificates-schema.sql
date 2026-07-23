-- Fix Certificates Table Schema
-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    -- Rename columns if they still use the old names
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='student_id') THEN
        ALTER TABLE certificates RENAME COLUMN student_id TO user_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='certificate_id') THEN
        ALTER TABLE certificates RENAME COLUMN certificate_id TO certificate_number;
    END IF;

    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='domain') THEN
        ALTER TABLE certificates ADD COLUMN domain VARCHAR(100) DEFAULT 'Web Development';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='sent_status') THEN
        ALTER TABLE certificates ADD COLUMN sent_status VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
DROP POLICY IF EXISTS "Students can view their own certificates" ON certificates;

-- Re-create policies using existing user_id column
CREATE POLICY "Admins can manage all certificates" 
ON certificates FOR ALL 
TO authenticated 
USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Students can view their own certificates" 
ON certificates FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Ensure correct indices
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_num ON certificates(certificate_number);
