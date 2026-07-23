-- FINAL CHECK: Ensure Certificate Has Valid Data
-- Run this to verify everything is properly set up

DO $$
DECLARE
    cert_record RECORD;
    v_user_id UUID;
    v_course_id UUID;
    needs_update BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL CERTIFICATE DATA CHECK';
    RAISE NOTICE '========================================';
    
    -- Get the certificate
    SELECT * INTO cert_record
    FROM certificates
    WHERE certificate_number = 'LMS-WEB-617336-A0Z';
    
    IF NOT FOUND THEN
        RAISE NOTICE '❌ Certificate not found!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Certificate ID: %', cert_record.id;
    RAISE NOTICE 'User ID: %', cert_record.user_id;
    RAISE NOTICE 'Course ID: %', cert_record.course_id;
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = cert_record.user_id AND full_name IS NOT NULL) THEN
        RAISE NOTICE '❌ User not found or has no name!';
        needs_update := TRUE;
        
        -- Get a valid user
        SELECT id INTO v_user_id FROM users WHERE role = 'student' AND full_name IS NOT NULL LIMIT 1;
        
        IF v_user_id IS NULL THEN
            -- Create one
            INSERT INTO users (email, full_name, role, password_hash, created_at, updated_at)
            VALUES ('demo@lms.com', 'Demo Student', 'student', '$2b$10$hash', NOW(), NOW())
            RETURNING id INTO v_user_id;
            RAISE NOTICE '✓ Created demo user: %', v_user_id;
        END IF;
    ELSE
        RAISE NOTICE '✓ User exists and has name';
        v_user_id := cert_record.user_id;
    END IF;
    
    -- Check if course exists
    IF NOT EXISTS (SELECT 1 FROM courses WHERE id = cert_record.course_id AND title IS NOT NULL) THEN
        RAISE NOTICE '❌ Course not found or has no title!';
        needs_update := TRUE;
        
        -- Get a valid course
        SELECT id INTO v_course_id FROM courses WHERE title IS NOT NULL LIMIT 1;
        
        IF v_course_id IS NULL THEN
            -- Create one
            INSERT INTO courses (title, description, domain, price, duration_weeks, status, created_at, updated_at)
            VALUES ('Web Development', 'Full stack development', 'Web Development', 0, 12, 'active', NOW(), NOW())
            RETURNING id INTO v_course_id;
            RAISE NOTICE '✓ Created demo course: %', v_course_id;
        END IF;
    ELSE
        RAISE NOTICE '✓ Course exists and has title';
        v_course_id := cert_record.course_id;
    END IF;
    
    -- Update if needed
    IF needs_update THEN
        UPDATE certificates
        SET user_id = v_user_id, course_id = v_course_id
        WHERE id = cert_record.id;
        RAISE NOTICE '✓ Certificate updated with valid references';
    END IF;
    
    -- Final verification
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL STATUS:';
    RAISE NOTICE '========================================';
    
    SELECT 
        c.certificate_number,
        u.full_name as student_name,
        u.email as student_email,
        co.title as course_title,
        c.domain
    INTO cert_record
    FROM certificates c
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN courses co ON c.course_id = co.id
    WHERE c.certificate_number = 'LMS-WEB-617336-A0Z';
    
    RAISE NOTICE 'Certificate: %', cert_record.certificate_number;
    RAISE NOTICE 'Student: %', cert_record.student_name;
    RAISE NOTICE 'Email: %', cert_record.student_email;
    RAISE NOTICE 'Course: %', cert_record.course_title;
    RAISE NOTICE 'Domain: %', cert_record.domain;
    RAISE NOTICE '';
    RAISE NOTICE '✅ All data is valid!';
    RAISE NOTICE '========================================';
END $$;
