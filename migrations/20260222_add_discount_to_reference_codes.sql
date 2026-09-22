-- ==============================================================================
-- MIGRATION: Add Discount Percentage to Scholarship Reference Codes
-- Description: Adds discount_percent column to scholarship_reference_codes table
-- ==============================================================================

-- 1. Create scholarship_reference_codes table if it does not already exist
CREATE TABLE IF NOT EXISTS public.scholarship_reference_codes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    discount_percent NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add discount_percent column if table already existed without it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'scholarship_reference_codes' 
          AND column_name = 'discount_percent'
    ) THEN
        ALTER TABLE public.scholarship_reference_codes 
        ADD COLUMN discount_percent NUMERIC NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 3. Create indices for high performance lookups
CREATE INDEX IF NOT EXISTS idx_scholarship_ref_code ON public.scholarship_reference_codes(code);
CREATE INDEX IF NOT EXISTS idx_scholarship_ref_status ON public.scholarship_reference_codes(status);

-- 4. Enable Row Level Security (RLS) & Public read policy for verification
ALTER TABLE public.scholarship_reference_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scholarship_reference_codes' 
          AND policyname = 'Allow public read active reference codes'
    ) THEN
        CREATE POLICY "Allow public read active reference codes"
            ON public.scholarship_reference_codes
            FOR SELECT
            USING (true);
    END IF;
END $$;
