-- Migration: Add course and branch columns to workshop_registrations
-- Date: 2026-10-24

ALTER TABLE public.workshop_registrations 
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT;

-- Create index for quick filtering if needed
CREATE INDEX IF NOT EXISTS idx_workshop_reg_course ON public.workshop_registrations(course);
CREATE INDEX IF NOT EXISTS idx_workshop_reg_branch ON public.workshop_registrations(branch);
