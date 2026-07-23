-- Sample projects for testing student submission feature
-- Run this after setting up the deadline column and RLS policies

-- First, get some existing user and course IDs
-- Replace these with actual IDs from your database

-- Sample projects for different students
INSERT INTO projects (
  title,
  description,
  user_id,
  course_id,
  status,
  deadline
) VALUES
-- Project 1: In Progress
(
  'Personal Portfolio Website',
  'Create a responsive portfolio website showcasing your skills and projects',
  '4a1be295-cbc3-4fa7-9e95-7669e2572e2a', -- Replace with actual student user_id
  '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Replace with actual course_id
  'in_progress',
  (NOW() + INTERVAL '30 days')
),

-- Project 2: Submitted (ready for review)
(
  'E-commerce Website',
  'Build a full-featured e-commerce website with shopping cart functionality',
  '4a1be295-cbc3-4fa7-9e95-7669e2572e2a', -- Replace with actual student user_id
  '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Replace with actual course_id
  'submitted',
  (NOW() + INTERVAL '15 days')
),

-- Project 3: For testing different student
(
  'Task Management App',
  'Create a task management application with user authentication',
  '4a1be295-cbc3-4fa7-9e95-7669e2572e2a', -- Replace with different student user_id
  '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Replace with actual course_id
  'in_progress',
  (NOW() + INTERVAL '45 days')
)

-- Update submitted project with sample URLs
ON CONFLICT (id) DO NOTHING;

-- Add sample submission data for the submitted project
UPDATE projects 
SET 
  project_url = 'https://sample-ecommerce.vercel.app',
  github_url = 'https://github.com/student/ecommerce-project',
  submitted_at = NOW()
WHERE title = 'E-commerce Website' AND status = 'submitted';

-- Verify the projects were created
SELECT 
  p.id,
  p.title,
  p.status,
  p.deadline,
  u.full_name as student_name,
  c.title as course_name
FROM projects p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN courses c ON p.course_id = c.id
ORDER BY p.created_at DESC;