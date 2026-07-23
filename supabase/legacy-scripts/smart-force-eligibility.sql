-- Smart Force Eligibility (Fixed for ANY schema)
-- This script detects columns in 'profiles' and inserts only what exists.

DO $$
DECLARE
    new_student_id UUID;
    new_course_id UUID;
    new_week_id UUID;
    new_video_id UUID;
BEGIN
    -- 1. Find an EXISTING student/profile
    -- Since video_progress references profiles, we MUST pick an ID that exists in profiles.
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        SELECT id INTO new_student_id FROM profiles LIMIT 1;
    ELSE
        SELECT id INTO new_student_id FROM users WHERE role = 'student' LIMIT 1;
    END IF;

    IF new_student_id IS NULL THEN
        RAISE EXCEPTION 'No student/profile found! Please sign up a user first.';
    END IF;

    RAISE NOTICE 'Using existing Student ID: %', new_student_id;

    -- 2. Skip Creating New User/Profile (We use existing)
    -- This section is removed as we are using a valid existing user.

    -- 3. Create Course
    INSERT INTO courses (title, description, level, status)
    VALUES ('Smart Certificate Course', 'For testing', 'beginner', 'active')
    RETURNING id INTO new_course_id;

    -- 4. Create Week
    INSERT INTO weeks (course_id, title, week_number)
    VALUES (new_course_id, 'Week 1', 1)
    RETURNING id INTO new_week_id;

    -- 5. Create Video
    INSERT INTO videos (week_id, title, video_url, duration_minutes, order_index)
    VALUES (new_week_id, 'Video 1', 'https://example.com', 10, 1)
    RETURNING id INTO new_video_id;

    -- 6. Mark Complete
    INSERT INTO video_progress (user_id, video_id, completed)
    VALUES (new_student_id, new_video_id, true)
    ON CONFLICT (user_id, video_id) DO UPDATE SET completed = true;

    RAISE NOTICE 'SUCCESS! Setup Complete.';
    RAISE NOTICE 'Go to Admin > Certificates > Issue Certificate.';
    RAISE NOTICE 'Select Course: "Smart Certificate Course".';
END $$;
