-- ROBUST REPAIR: Fix all Badges Table NOT NULL Constraints
-- This script handles 'criteria', 'badge_type', and other legacy columns once and for all.

DO $$ 
BEGIN
  -- 1. Ensure new columns exist
  ALTER TABLE badges ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'achievement';
  ALTER TABLE badges ADD COLUMN IF NOT EXISTS rule_type VARCHAR(100) DEFAULT 'manual';
  ALTER TABLE badges ADD COLUMN IF NOT EXISTS rule_value INTEGER DEFAULT 1;

  -- 2. REMOVE STRICT CONSTRAINTS from legacy columns (Whack-a-mole fix)
  -- These columns exist in old schemas but our new system uses rule_type instead.
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'criteria') THEN
    ALTER TABLE badges ALTER COLUMN criteria DROP NOT NULL;
    RAISE NOTICE 'Made criteria nullable';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'badge_type') THEN
    ALTER TABLE badges ALTER COLUMN badge_type DROP NOT NULL;
    RAISE NOTICE 'Made badge_type nullable';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'points_required') THEN
    ALTER TABLE badges ALTER COLUMN points_required SET DEFAULT 0;
    ALTER TABLE badges ALTER COLUMN points_required DROP NOT NULL;
    RAISE NOTICE 'Made points_required safe';
  END IF;

END $$;

-- 3. CLEAN & INSERT (Industrial Seed)
DELETE FROM badges WHERE name IN ('Week Warrior', 'Speed Runner', 'First Video');

INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value)
VALUES 
('First Video', 'Watch your first lecture', '📺', 'completion', 'video_completed', 1),
('Week Warrior', 'Complete all videos in a week', '⚔️', 'completion', 'week_completed', 1),
('Speed Runner', 'Watch 5 videos in one day', '⚡', 'achievement', 'video_completed', 5);

-- 4. FORCE REFRESH CACHE
NOTIFY pgrst, 'reload schema';
