-- ==============================================================================
-- Migration: Create Notices & Announcements Table with Posters & Attachments Support
-- Date: 2026-02-22
-- ==============================================================================

-- 1. Create notices table
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General', -- 'Scholarship', 'Examination', 'Admissions', 'Event', 'Urgent', 'General'
    badge_text VARCHAR(50) DEFAULT 'NEW',     -- 'NEW', 'IMPORTANT', 'URGENT', 'REVISED', 'OFFICIAL'
    description TEXT,
    content TEXT,                             -- Extended rich notice content
    file_url TEXT,                            -- Attachment URL (JPG/PNG poster or PDF)
    file_type VARCHAR(50),                    -- 'pdf', 'image/jpeg', 'image/png', 'image/webp'
    file_name VARCHAR(255),
    file_size VARCHAR(50),
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    views_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_notices_active_pinned ON public.notices (is_active, is_pinned DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices (category);

-- 3. Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone to read active notices
DROP POLICY IF EXISTS "Public can view active notices" ON public.notices;
CREATE POLICY "Public can view active notices"
    ON public.notices FOR SELECT
    USING (is_active = true);

-- Allow superadmins/service role full access
DROP POLICY IF EXISTS "Admins full access to notices" ON public.notices;
CREATE POLICY "Admins full access to notices"
    ON public.notices FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Seed initial official notices & posters
INSERT INTO public.notices (title, category, badge_text, description, content, file_url, file_type, file_name, file_size, is_pinned, is_active, published_at)
VALUES 
(
    'GRAVITY National STEM Scholarship Examination 2026 - Schedule & Admit Cards',
    'Scholarship',
    'URGENT',
    'Official notice regarding the upcoming offline and computer-based STEM scholarship test dates, reporting instructions, and hall ticket verification.',
    'All registered applicants for the GRAVITY STEM Excellence Scholarship 2026 are hereby informed that the examination will be conducted across 12 designated district test centers. Please ensure you download your verified Admit Card and carry a valid photo ID.',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    'Scholarship_Exam_Schedule_2026.jpg',
    '1.2 MB',
    true,
    true,
    NOW()
),
(
    'Admission Guidelines & Free Mentorship Cohort Selection Criteria (Batch 2026-27)',
    'Admissions',
    'IMPORTANT',
    'Detailed circular regarding eligibility criteria, interview process, and fee subsidy waivers for economically weaker students.',
    'AAGAJ Foundation invites applications for its fully-funded industry upskilling and professional internship placement drive. Candidates can check eligibility matrix and apply online through the portal.',
    null,
    'pdf',
    'Admission_Policy_Circular_2026.pdf',
    '840 KB',
    true,
    true,
    NOW() - INTERVAL '2 days'
),
(
    'Annual Inter-School STEM Innovation Fest & Robotics Workshop Poster',
    'Event',
    'EVENT',
    'Official invitation and brochure for all partner schools participating in the Inter-School Innovation Showcase 2026.',
    'Partner schools and affiliated institutes can nominate up to 15 student projects for the state-level exhibition. Exciting cash prizes and direct scholarship grants will be awarded to top innovators.',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    'STEM_Fest_Poster_2026.jpg',
    '2.4 MB',
    false,
    true,
    NOW() - INTERVAL '5 days'
),
(
    'Revised Examination Guidelines & Prohibited Items Circular',
    'Examination',
    'OFFICIAL',
    'Standard operating procedures, biometric attendance guidelines, and list of prohibited electronic items inside examination halls.',
    'Candidates must report to their allotted test centers at least 45 minutes prior to the commencement of the exam. Smartwatches, bluetooth devices, and calculators are strictly prohibited.',
    null,
    'pdf',
    'Exam_Guidelines_SOP_2026.pdf',
    '520 KB',
    false,
    true,
    NOW() - INTERVAL '8 days'
)
ON CONFLICT DO NOTHING;
