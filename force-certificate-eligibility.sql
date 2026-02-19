-- Force Certificate Eligibility (Guaranteed)
-- This script creates a NEW test ecosystem to ensure eligibility works.

DO $$
DECLARE
    new_student_id UUID;
    new_course_id UUID;
    new_week_id UUID;
    new_video_id UUID;
BEGIN
    -- 1. Create a Test Student
    -- Note: This creates a user in public.users but NOT in auth.users. 
    -- This user cannot login but is sufficient for Admin UI testing.
    INSERT INTO users (email, full_name, role)
    VALUES ('cert_test_student@example.com', 'Certificate Tester', 'student')
    ON CONFLICT (email) DO UPDATE SET full_name = 'Certificate Tester'
    RETURNING id INTO new_student_id;

    RAISE NOTICE 'Student ID: %', new_student_id;

    -- 1b. Handle profiles table if it exists (Fix for foreign key error)
    -- The error "Key (user_id)=... is not present in table profiles" indicates video_progress references profiles.
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Profiles table detected. Inserting profile record...';
        BEGIN
            -- Try most common structure first
            INSERT INTO profiles (id, full_name, email, role)
            VALUES (new_student_id, 'Certificate Tester', 'cert_test_student@example.com', 'student')
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Standard profiles insert failed, trying without role...';
            BEGIN
                -- Try without role (maybe role doesn't exist in profiles)
                INSERT INTO profiles (id, full_name, email)
                VALUES (new_student_id, 'Certificate Tester', 'cert_test_student@example.com')
                ON CONFLICT (id) DO NOTHING;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Profiles insert failed again, trying minimal...';
                 -- Try minimal (maybe full_name doesn't exist)
                 INSERT INTO profiles (id, email) 
                 VALUES (new_student_id, 'cert_test_student@example.com') 
                 ON CONFLICT (id) DO NOTHING;
            END;
        END;
    END IF;

    -- 2. Create a Test Course
    INSERT INTO courses (title, description, level, status)
    VALUES ('Certificate Test Course', 'A course specifically for testing certificates', 'beginner', 'active')
    RETURNING id INTO new_course_id;

    RAISE NOTICE 'Course ID: %', new_course_id;

    -- 3. Create a Test Week
    INSERT INTO weeks (course_id, title, week_number)
    VALUES (new_course_id, 'Test Week 1', 1)
    RETURNING id INTO new_week_id;

    -- 4. Create a Test Video
    INSERT INTO videos (week_id, title, video_url, duration_minutes, order_index)
    VALUES (new_week_id, 'Test Video 1', 'https://example.com/video', 10, 1)
    RETURNING id INTO new_video_id;

    -- 5. Mark Video as Completed
    INSERT INTO video_progress (user_id, video_id, completed)
    VALUES (new_student_id, new_video_id, true)
    ON CONFLICT (user_id, video_id) DO UPDATE SET completed = true;

    RAISE NOTICE 'SUCCESS! Setup Complete.';
    RAISE NOTICE '1. Go to Admin > Certificates > Issue Certificate.';
    RAISE NOTICE '2. Select Course: "Certificate Test Course".';
    RAISE NOTICE '3. You should see "Certificate Tester" in the list.';
END $$;
