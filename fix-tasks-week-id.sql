-- Fix: Make week_id optional in tasks table
-- This allows tasks to be created without being tied to a specific week

-- First, let's check if the column exists and is nullable
-- If week_id column doesn't allow NULL, we need to modify it

ALTER TABLE tasks 
ALTER COLUMN week_id DROP NOT NULL;

-- Add the week_id column if it doesn't exist
-- (This is safe with IF NOT EXISTS implicit behavior)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS week_id UUID REFERENCES weeks(id) ON DELETE SET NULL;
