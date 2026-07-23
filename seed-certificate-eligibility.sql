-- Seed Certificate Eligibility for Testing
-- This script will:
-- 1. Select the first available student (or a specific email if you uncomment it)
-- 2. Select the first available course (or a specific title if you uncomment it)
-- 3. Mark ALL videos in that course as "completed" for that student
-- 4. Result: The student should appear in the "Issue Certificate" list for that course only if they don't already have a certificate

DO $$
DECLARE
    target_student_id UUID;
    target_course_id UUID;
    video_record RECORD;
    progress_count INTEGER := 0;
BEGIN
    -- 1. Get a student (You can change the WHERE clause to target a specific email)
    SELECT id INTO target_student_id FROM users WHERE role = 'student' LIMIT 1;
    -- target_student_id := 'SPECIFIC_UUID_HERE'; -- Uncomment to hardcode

    -- 2. Get a course
    SELECT id INTO target_course_id FROM courses LIMIT 1;
    -- target_course_id := 'SPECIFIC_UUID_HERE'; -- Uncomment to hardcode

    IF target_student_id IS NULL THEN
        RAISE NOTICE 'No students found!';
        RETURN;
    END IF;

    IF target_course_id IS NULL THEN
        RAISE NOTICE 'No courses found!';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding data for Student ID: % and Course ID: %', target_student_id, target_course_id;

    -- 3. Loop through all videos in the course and insert progress
    FOR video_record IN 
        SELECT v.id 
        FROM videos v
        JOIN weeks w ON v.week_id = w.id
        WHERE w.course_id = target_course_id
    LOOP
        INSERT INTO video_progress (user_id, video_id, completed, updated_at)
        VALUES (target_student_id, video_record.id, true, NOW())
        ON CONFLICT (user_id, video_id) 
        DO UPDATE SET completed = true, updated_at = NOW();
        
        progress_count := progress_count + 1;
    END LOOP;

    RAISE NOTICE 'Marked % videos as completed for the student.', progress_count;
END $$;
