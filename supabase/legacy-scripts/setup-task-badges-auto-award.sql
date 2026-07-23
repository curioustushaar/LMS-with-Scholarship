-- ==========================================
-- TASK BADGE AUTO-AWARDING SETUP
-- ==========================================
-- Create task completion badges that will be automatically awarded
-- when students complete tasks and admin approves them
-- ==========================================

BEGIN;

-- ==========================================
-- FIX USER_BADGES TABLE FOREIGN KEYS
-- ==========================================
-- Update user_badges to reference profiles instead of users

-- Drop existing foreign key constraints on user_badges
DO $$
BEGIN
  -- Drop user_id constraint if exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'user_badges_user_id_fkey' 
             AND table_name = 'user_badges') THEN
    ALTER TABLE user_badges DROP CONSTRAINT user_badges_user_id_fkey;
  END IF;

  -- Drop awarded_by constraint if exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'user_badges_awarded_by_fkey' 
             AND table_name = 'user_badges') THEN
    ALTER TABLE user_badges DROP CONSTRAINT user_badges_awarded_by_fkey;
  END IF;
END $$;

-- Add new foreign keys pointing to profiles table
ALTER TABLE user_badges 
  ADD CONSTRAINT user_badges_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_badges 
  ADD CONSTRAINT user_badges_awarded_by_fkey 
  FOREIGN KEY (awarded_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Ensure user_badges table has all required columns
DO $$
BEGIN
  -- Add awarded_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'awarded_at') THEN
    ALTER TABLE user_badges ADD COLUMN awarded_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

-- Ensure badges table has all required columns for rules engine
DO $$ 
BEGIN
  -- Add category column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'category') THEN
    ALTER TABLE badges ADD COLUMN category VARCHAR(100) DEFAULT 'achievement';
  END IF;

  -- Add rule_type column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_type') THEN
    ALTER TABLE badges ADD COLUMN rule_type VARCHAR(100) DEFAULT 'manual';
  END IF;

  -- Add rule_value column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_value') THEN
    ALTER TABLE badges ADD COLUMN rule_value INTEGER DEFAULT 1;
  END IF;

  -- Add rule_duration column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_duration') THEN
    ALTER TABLE badges ADD COLUMN rule_duration INTEGER;
  END IF;
END $$;

-- ==========================================
-- CREATE TASK COMPLETION BADGES
-- ==========================================

-- Delete existing task badges to avoid duplicates
DELETE FROM badges WHERE category = 'tasks';

-- 1. Task Worrier - Complete 1 task (First task badge)
INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value, criteria)
VALUES (
  'Task worrier',
  'complete task earn',
  '🏆',
  'tasks',
  'task_submitted',
  1,
  'Submit and get approved for your first task'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  category = EXCLUDED.category,
  rule_type = EXCLUDED.rule_type,
  rule_value = EXCLUDED.rule_value,
  criteria = EXCLUDED.criteria;

-- 2. Task Master - Complete 5 tasks
INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value, criteria)
VALUES (
  'Task Master',
  'Complete 5 approved tasks',
  '📝',
  'tasks',
  'task_submitted',
  5,
  'Submit and get approved for 5 tasks'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  category = EXCLUDED.category,
  rule_type = EXCLUDED.rule_type,
  rule_value = EXCLUDED.rule_value,
  criteria = EXCLUDED.criteria;

-- 3. Task Champion - Complete 10 tasks
INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value, criteria)
VALUES (
  'Task Champion',
  'Complete 10 approved tasks',
  '⭐',
  'tasks',
  'task_submitted',
  10,
  'Submit and get approved for 10 tasks'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  category = EXCLUDED.category,
  rule_type = EXCLUDED.rule_type,
  rule_value = EXCLUDED.rule_value,
  criteria = EXCLUDED.criteria;

-- 4. Task Legend - Complete 20 tasks
INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value, criteria)
VALUES (
  'Task Legend',
  'Complete 20 approved tasks',
  '👑',
  'tasks',
  'task_submitted',
  20,
  'Submit and get approved for 20 tasks'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  category = EXCLUDED.category,
  rule_type = EXCLUDED.rule_type,
  rule_value = EXCLUDED.rule_value,
  criteria = EXCLUDED.criteria;

COMMIT;

-- ==========================================
-- VERIFY BADGE SETUP
-- ==========================================

-- Check all task badges
SELECT 
  id,
  name,
  description,
  icon_url,
  category,
  rule_type,
  rule_value,
  criteria,
  created_at
FROM badges
WHERE category = 'tasks'
ORDER BY rule_value ASC;

-- ==========================================
-- CHECK CURRENT BADGE AWARDS
-- ==========================================

-- See which students have earned task badges
SELECT 
  p.full_name,
  p.email,
  b.name as badge_name,
  b.rule_value as tasks_required,
  ub.awarded_at
FROM user_badges ub
JOIN profiles p ON ub.user_id = p.id
JOIN badges b ON ub.badge_id = b.id
WHERE b.category = 'tasks'
ORDER BY ub.awarded_at DESC;

-- ==========================================
-- ✅ SETUP COMPLETE
-- ==========================================
-- 
-- HOW IT WORKS:
-- 1. Admin approves a student's task submission
-- 2. Backend automatically counts student's approved tasks
-- 3. Checks which badges the student qualifies for
-- 4. Awards badges automatically if criteria met
-- 5. Student will see new badges in their profile
--
-- BADGES CREATED:
-- 🏆 Task worrier - 1 approved task
-- 📝 Task Master - 5 approved tasks
-- ⭐ Task Champion - 10 approved tasks
-- 👑 Task Legend - 20 approved tasks
--
-- ==========================================
