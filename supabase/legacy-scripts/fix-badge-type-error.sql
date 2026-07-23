-- Migration: Fix badge_type constraint error
-- This script makes 'badge_type' nullable and ensures the schema is aligned

DO $$ 
BEGIN
  -- 1. If badge_type exists and is NOT NULL, make it nullable
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'badges' AND column_name = 'badge_type') THEN
    ALTER TABLE badges ALTER COLUMN badge_type DROP NOT NULL;
    RAISE NOTICE 'Made badge_type column nullable';
  END IF;

  -- 2. Ensure our new rule engine columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'category') THEN
    ALTER TABLE badges ADD COLUMN category VARCHAR(100) DEFAULT 'achievement';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_type') THEN
    ALTER TABLE badges ADD COLUMN rule_type VARCHAR(100) DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rule_value') THEN
    ALTER TABLE badges ADD COLUMN rule_value INTEGER DEFAULT 1;
  END IF;

END $$;

-- 3. Clean and Retry Seed with safe columns
DELETE FROM badges WHERE name IN ('Week Warrior', 'Speed Runner');

INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value)
VALUES 
('Week Warrior', 'Complete all videos in 7 days', '⚔️', 'completion', 'week_completed', 1),
('Speed Runner', 'Watch 5 videos in one day', '⚡', 'achievement', 'video_completed', 5);

-- Final Cache Refresh
NOTIFY pgrst, 'reload schema';
