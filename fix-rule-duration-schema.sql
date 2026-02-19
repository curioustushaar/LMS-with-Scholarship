-- FINAL SCHEMA FIX: Add rule_duration and all missing badge columns
-- This script ensures the Supabase schema cache is updated.

-- 1. Add missing columns with safety checks
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rule_duration INTEGER DEFAULT NULL;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'achievement';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rule_type VARCHAR(100) DEFAULT 'manual';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rule_value INTEGER DEFAULT 1;

-- 2. Ensure legacy columns are nullable to avoid 500 errors
ALTER TABLE badges ALTER COLUMN criteria DROP NOT NULL;
ALTER TABLE badges ALTER COLUMN badge_type DROP NOT NULL;
ALTER TABLE badges ALTER COLUMN points_required DROP NOT NULL;

-- 3. Hard Refresh of Supabase PostgREST cache
NOTIFY pgrst, 'reload schema';
