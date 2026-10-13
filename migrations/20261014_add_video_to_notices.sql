-- ==============================================================================
-- Migration: Add YouTube Video & Video Description to Notices Table
-- Date: 2026-10-14
-- ==============================================================================

-- 1. Add video_url and video_description columns to notices table
ALTER TABLE public.notices 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_description TEXT;

-- 2. Add documentation comments
COMMENT ON COLUMN public.notices.video_url IS 'YouTube video URL or embed link for the announcement / circular';
COMMENT ON COLUMN public.notices.video_description IS 'Short description or key takeaways for the attached video';

-- 3. Update sample notice if exists with a video demo (optional)
UPDATE public.notices 
SET 
  video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  video_description = 'Official orientation briefing explaining guidelines, verification criteria, and test procedure.'
WHERE id IN (
  SELECT id FROM public.notices 
  WHERE category = 'Scholarship' AND video_url IS NULL 
  LIMIT 1
);
