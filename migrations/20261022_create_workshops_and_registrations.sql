-- Migration: Create workshops and workshop_registrations tables
-- Date: 2026-10-22

CREATE TABLE IF NOT EXISTS public.workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration_type TEXT DEFAULT '3_days', -- '1_day', '3_days', '1_week', 'custom'
    duration_badge TEXT DEFAULT '3 Days Workshop',
    start_date DATE,
    end_date DATE,
    timing TEXT, -- e.g. "06:00 PM - 08:00 PM IST"
    platform TEXT DEFAULT 'Google Meet', -- 'Zoom', 'Google Meet', 'Microsoft Teams'
    meeting_link TEXT NOT NULL,
    meeting_id TEXT,
    passcode TEXT,
    instructor_name TEXT,
    instructor_role TEXT,
    status TEXT DEFAULT 'published', -- 'published', 'draft', 'completed'
    max_seats INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workshop_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'registered',
    registered_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_workshops_status ON public.workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshops_created_at ON public.workshops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshop_reg_workshop_id ON public.workshop_registrations(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_reg_email ON public.workshop_registrations(email);
CREATE INDEX IF NOT EXISTS idx_workshop_reg_phone ON public.workshop_registrations(phone);

-- Enable RLS
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public read of published workshops
CREATE POLICY "Public can view published workshops"
    ON public.workshops
    FOR SELECT
    USING (status = 'published');

-- Allow superadmin full access to workshops
CREATE POLICY "Superadmin full access to workshops"
    ON public.workshops
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow public to insert registrations
CREATE POLICY "Public can insert workshop registrations"
    ON public.workshop_registrations
    FOR INSERT
    WITH CHECK (true);

-- Allow superadmin full access to registrations
CREATE POLICY "Superadmin full access to registrations"
    ON public.workshop_registrations
    FOR ALL
    USING (true)
    WITH CHECK (true);
