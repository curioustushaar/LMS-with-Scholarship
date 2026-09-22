-- Migration: Add institution_type to schools table for School & Coaching Tie-ups
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS institution_type TEXT DEFAULT 'school';

CREATE INDEX IF NOT EXISTS idx_schools_institution_type ON schools(institution_type);
