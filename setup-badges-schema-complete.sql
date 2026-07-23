-- ====================================================================
-- 🏅 COMPLETE INDUSTRIAL BADGE SYSTEM SCHEMA SETUP & SEED
-- ====================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to fix the badges schema, foreign keys, and populate standard rules.
-- ====================================================================

BEGIN;

-- 1. Ensure the badges table exists and contains all rules engine columns
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria TEXT,
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add rule system columns with safety checks
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'achievement';
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS rule_type VARCHAR(100) DEFAULT 'manual';
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS rule_value INTEGER DEFAULT 1;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS rule_duration INTEGER;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS logic_gate VARCHAR(20) DEFAULT 'AND';

-- 3. Relax legacy constraints from older schema variations (prevent NOT NULL conflicts)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'badges' AND column_name = 'criteria') THEN
    ALTER TABLE public.badges ALTER COLUMN criteria DROP NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'badges' AND column_name = 'badge_type') THEN
    ALTER TABLE public.badges ALTER COLUMN badge_type DROP NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'badges' AND column_name = 'points_required') THEN
    ALTER TABLE public.badges ALTER COLUMN points_required DROP NOT NULL;
    ALTER TABLE public.badges ALTER COLUMN points_required SET DEFAULT 0;
  END IF;
END $$;

-- 4. Fix user_badges foreign keys to point to public.profiles table (instead of auth.users)
-- Drop existing constraints if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'user_badges_user_id_fkey' AND table_name = 'user_badges') THEN
    ALTER TABLE public.user_badges DROP CONSTRAINT user_badges_user_id_fkey;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'user_badges_awarded_by_fkey' AND table_name = 'user_badges') THEN
    ALTER TABLE public.user_badges DROP CONSTRAINT user_badges_awarded_by_fkey;
  END IF;
END $$;

-- Add updated foreign key references referencing public.profiles(id)
ALTER TABLE public.user_badges 
  ADD CONSTRAINT user_badges_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_badges 
  ADD CONSTRAINT user_badges_awarded_by_fkey 
  FOREIGN KEY (awarded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. Seed / Reset standard industrial badges
DELETE FROM public.badges 
WHERE name IN (
  'First Video', 
  'Week Warrior', 
  'Speed Runner', 
  'Task worrier', 
  'Task Master', 
  'Task Champion', 
  'Task Legend', 
  'Quiz Whiz'
);

INSERT INTO public.badges (name, description, icon_url, category, rule_type, rule_value, criteria)
VALUES 
('First Video', 'Watch your first lecture video', '📺', 'completion', 'video_completed', 1, 'Watch 1 lecture video'),
('Week Warrior', 'Complete all weekly content in 7 days', '⚔️', 'completion', 'week_completed', 1, 'Complete all tasks & videos in any week'),
('Speed Runner', 'Watch 5 lectures in a single day', '⚡', 'achievement', 'video_completed', 5, 'Watch 5 videos in 24 hours'),
('Task worrier', 'Submit and get approval for your first task', '🏆', 'tasks', 'task_submitted', 1, 'Submit 1 approved task'),
('Task Master', 'Submit and get approval for 5 tasks', '📝', 'tasks', 'task_submitted', 5, 'Submit 5 approved tasks'),
('Task Champion', 'Submit and get approval for 10 tasks', '⭐', 'tasks', 'task_submitted', 10, 'Submit 10 approved tasks'),
('Task Legend', 'Submit and get approval for 20 tasks', '👑', 'tasks', 'task_submitted', 20, 'Submit 20 approved tasks'),
('Quiz Whiz', 'Score 100% on any course quiz', '🧠', 'achievement', 'quiz_score', 100, 'Score 100% on any quiz');

COMMIT;

-- 6. Reload schema cache for PostgREST / Supabase API
NOTIFY pgrst, 'reload schema';
