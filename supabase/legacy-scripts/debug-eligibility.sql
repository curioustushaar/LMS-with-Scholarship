-- Debug Certificate Eligibility
-- Run this to see why a student isn't showing up as "Eligible"

DO $$
DECLARE
    target_course_id UUID;
    target_student_id UUID;
    total_videos INTEGER;
    completed_videos INTEGER;
    has_certificate BOOLEAN;
BEGIN
    -- 1. Get the first course (same logic as seed script)
    SELECT id INTO target_course_id FROM courses LIMIT 1;
    
    -- 2. Get the first student
    SELECT id INTO target_student_id FROM users WHERE role = 'student' LIMIT 1;

    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE 'DEBUGGING ELIGIBILITY';
    RAISE NOTICE 'Course ID: %', target_course_id;
    RAISE NOTICE 'Student ID: %', target_student_id;
    RAISE NOTICE '------------------------------------------------';

    -- 3. Check Total Videos in Course
    SELECT COUNT(*) INTO total_videos
    FROM videos v
    JOIN weeks w ON v.week_id = w.id
    WHERE w.course_id = target_course_id;

    RAISE NOTICE 'Total Videos in Course: %', total_videos;

    -- 4. Check Completed Videos for Student
    SELECT COUNT(*) INTO completed_videos
    FROM video_progress vp
    JOIN videos v ON vp.video_id = v.id
    JOIN weeks w ON v.week_id = w.id
    WHERE vp.user_id = target_student_id
    AND w.course_id = target_course_id
    AND vp.completed = true;

    RAISE NOTICE 'Completed Videos for Student: %', completed_videos;

    -- 5. Check if Certificate Already Exists
    SELECT EXISTS (
        SELECT 1 FROM certificates 
        WHERE user_id = target_student_id 
        AND course_id = target_course_id
    ) INTO has_certificate;

    RAISE NOTICE 'Certificate Already Exists: %', has_certificate;
    RAISE NOTICE '------------------------------------------------';

    -- 6. Conclusion
    IF total_videos = 0 THEN
        RAISE NOTICE 'CONCLUSION: Course has NO videos. Add videos to the course first.';
    ELSIF completed_videos < total_videos THEN
        RAISE NOTICE 'CONCLUSION: Student has NOT completed all videos (%/%)', completed_videos, total_videos;
    ELSIF has_certificate THEN
        RAISE NOTICE 'CONCLUSION: Student ALREADY has a certificate.';
    ELSE
        RAISE NOTICE 'CONCLUSION: Student SHOULD be eligible.';
    END IF;
END $$;
