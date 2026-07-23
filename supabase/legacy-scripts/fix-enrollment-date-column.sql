-- ==========================================
-- FIX: Add enrollment_date column to users table if missing
-- ==========================================
-- Run this in Supabase SQL Editor if you get enrollment_date schema cache error

-- Add enrollment_date column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMP DEFAULT NOW();

-- Update existing records that don't have enrollment_date
UPDATE users 
SET enrollment_date = created_at 
WHERE enrollment_date IS NULL;

-- Verify the column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'enrollment_date';
