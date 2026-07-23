-- Quick test project - guaranteed to work
-- This creates a project that should definitely show up

-- Insert a simple test project directly
INSERT INTO projects (
  title,
  description,
  user_id,
  course_id,
  status,
  deadline,
  created_at,
  updated_at
) 
SELECT 
  'Test Project - Portfolio Website',
  'A test project to verify the system is working correctly',
  u.id,
  c.id,
  'in_progress',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
FROM users u, courses c 
WHERE u.role = 'student' 
  AND c.id IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert another submitted project
INSERT INTO projects (
  title,
  description,
  user_id,
  course_id,
  status,
  deadline,
  project_url,
  submitted_at,
  created_at,
  updated_at
) 
SELECT 
  'Test Project - E-commerce Site',
  'Student submitted e-commerce website project',
  u.id,
  c.id,
  'submitted',
  NOW() + INTERVAL '15 days',
  'https://example-project.vercel.app',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '5 days',
  NOW()
FROM users u, courses c 
WHERE u.role = 'student' 
  AND c.id IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verify projects exist
SELECT 
  id, 
  title, 
  status, 
  user_id, 
  course_id,
  created_at
FROM projects 
ORDER BY created_at DESC;