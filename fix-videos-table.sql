-- Fix videos table permissions
-- Run this in Supabase SQL Editor if videos aren't saving

-- Disable RLS on videos table if enabled
ALTER TABLE IF EXISTS videos DISABLE ROW LEVEL SECURITY;

-- Ensure videos table exists with correct structure
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_week_id ON videos(week_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(week_id, "order");

-- Grant permissions to service role
GRANT ALL ON videos TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.videos TO service_role;

-- Make sure anon key can read videos
GRANT SELECT ON videos TO anon;

-- Done!
SELECT 'Videos table fixed! ✅';
