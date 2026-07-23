-- Migration: Advanced Badge System with Rules Engine
-- This migration updates the badges table to support industrial rules

-- 1. Create Rule Type Enum (Optional but good for data integrity)
-- Note: checking if exists is harder for types in Postgres, using DO block
DO $$ 
BEGIN
  -- We'll add a 'category' column if missing (for UI grouping)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'category') THEN
    ALTER TABLE badges ADD COLUMN category VARCHAR(100) DEFAULT 'achievement';
  END IF;

  -- 2. Add Rule Engine Columns
  -- rule_type: define what triggers the badge (video_completed, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_type') THEN
    ALTER TABLE badges ADD COLUMN rule_type VARCHAR(100) DEFAULT 'manual';
  END IF;

  -- rule_value: threshold for the rule (e.g., 5 videos, 100 points)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_value') THEN
    ALTER TABLE badges ADD COLUMN rule_value INTEGER DEFAULT 1;
  END IF;

  -- rule_duration: time limit in days (e.g., 5 videos in 1 day)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_duration') THEN
    ALTER TABLE badges ADD COLUMN rule_duration INTEGER;
  END IF;

  -- logic_gate: 'AND' / 'OR' for complex rules (future proofing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'logic_gate') THEN
    ALTER TABLE badges ADD COLUMN logic_gate VARCHAR(20) DEFAULT 'AND';
  END IF;

END $$;

-- 3. Create Demo Badges with Industrial Rules
DELETE FROM badges WHERE rule_type != 'manual'; -- Clean old auto badges for demo

INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value)
VALUES 
('First Video', 'Watch your first lecture', '📺', 'completion', 'video_completed', 1),
('Week Warrior', 'Complete all videos in a week', '⚔️', 'completion', 'week_completed', 1),
('Task Master', 'Submit 5 assignments', '📝', 'tasks', 'task_submitted', 5),
('Quiz Whiz', 'Score 100 on any quiz', '🧠', 'achievement', 'quiz_score', 100);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
