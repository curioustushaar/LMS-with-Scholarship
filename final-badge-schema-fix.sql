-- FINAL REPAIR: Badges Table Schema Sync
-- This script adds missing columns one by one and refreshes everything.

-- 1. Add missing columns with safety checks
ALTER TABLE badges ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'achievement';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rule_type VARCHAR(100) DEFAULT 'manual';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rule_value INTEGER DEFAULT 1;

-- 2. Repair potential NOT NULL conflicts on old columns
ALTER TABLE badges ALTER COLUMN badge_type DROP NOT NULL;

-- 3. Clear old demo data to avoid duplicates
DELETE FROM badges WHERE name IN ('Week Warrior', 'Speed Runner', 'First Video');

-- 4. INSERT with full column awareness
INSERT INTO badges (name, description, icon_url, category, rule_type, rule_value)
VALUES 
('First Video', 'Watch your first lecture', '📺', 'completion', 'video_completed', 1),
('Week Warrior', 'Complete all videos in a week', '⚔️', 'completion', 'week_completed', 1),
('Speed Runner', 'Watch 5 videos in one day', '⚡', 'achievement', 'video_completed', 5);

-- 5. Hard refresh of Supabase cache
NOTIFY pgrst, 'reload schema';
