-- Migration: Add domain column to tasks table for domain-based filtering
-- Date: 2026-02-11

-- Add domain column to tasks
ALTER TABLE IF EXISTS public.tasks
  ADD COLUMN IF NOT EXISTS domain VARCHAR(128);

-- Create index for faster domain-based lookups
CREATE INDEX IF NOT EXISTS idx_tasks_domain ON public.tasks(domain);

-- Create index for course_id lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON public.tasks(course_id);

-- Update existing tasks to inherit domain from their course
UPDATE tasks t
SET domain = c.domain
FROM courses c
WHERE t.course_id = c.id
  AND t.domain IS NULL
  AND c.domain IS NOT NULL;

-- Verify the migration
SELECT 
  t.id, 
  t.title, 
  t.domain,
  c.title as course_title,
  c.domain as course_domain
FROM tasks t
LEFT JOIN courses c ON t.course_id = c.id
LIMIT 5;
