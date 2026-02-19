-- ==========================================================
-- INDUSTRIAL DEMO SEED: Task Submission & Score Calculation
-- ==========================================================
-- This script will create a demo student submission so you can
-- test the Evaluation features and see the score calculation.

DO $$ 
DECLARE
    demo_user_id UUID;
    demo_course_id UUID;
    demo_task_id UUID;
BEGIN
    -- 1. Get a student (Pick the first one found or create a dummy)
    SELECT id INTO demo_user_id FROM users WHERE role = 'student' LIMIT 1;
    IF demo_user_id IS NULL THEN
        INSERT INTO users (full_name, email, role) 
        VALUES ('Demo Student', 'student@example.com', 'student')
        RETURNING id INTO demo_user_id;
    END IF;

    -- 2. Get a course
    SELECT id INTO demo_course_id FROM courses LIMIT 1;
    IF demo_course_id IS NULL THEN
        INSERT INTO courses (title, description, status) 
        VALUES ('Full Stack Industrial Development', 'Learn by building real world apps', 'active')
        RETURNING id INTO demo_course_id;
    END IF;

    -- 3. Create an Industrial Task
    INSERT INTO tasks (title, description, course_id, max_points, status, task_type)
    VALUES ('Final Uber Clone Project', 'Implement authentication and socket.io', demo_course_id, 100, 'active', 'assignment')
    RETURNING id INTO demo_task_id;

    -- 4. INSERT DUMMY SUBMISSIONS (This is what you asked for)
    
    -- Submission 1: Already Evaluated (Score 85)
    INSERT INTO task_submissions (task_id, user_id, submission_url, status, points_awarded, feedback, submitted_at)
    VALUES (demo_task_id, demo_user_id, 'https://github.com/demo/uber-clone', 'approved', 85, 'Excellent architectural decisions!', NOW() - INTERVAL '2 days');

    -- Submission 2: Pending (Will show in "Evaluate Now" in UI)
    -- We use a different user or just another task to show "Pending"
    INSERT INTO task_submissions (task_id, user_id, submission_url, status, submitted_at)
    VALUES (demo_task_id, demo_user_id, 'https://github.com/demo/uber-clone-v2', 'submitted', NOW() - INTERVAL '1 hour')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Demo Data Created Successfully!';
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
