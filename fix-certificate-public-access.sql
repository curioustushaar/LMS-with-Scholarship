-- FIX: Enable Public Certificate Viewing
-- This allows anyone with the certificate URL to view it

BEGIN;

-- Drop existing public view policy if exists
DROP POLICY IF EXISTS "public_view_certificates" ON certificates;
DROP POLICY IF EXISTS "Allow public read" ON certificates;
DROP POLICY IF EXISTS "certificates_public_select" ON certificates;

-- Create a new policy for public certificate viewing
CREATE POLICY "public_view_certificates" ON certificates
    FOR SELECT
    TO anon
    USING (true);

-- Also ensure authenticated users can view
CREATE POLICY "authenticated_view_certificates" ON certificates
    FOR SELECT
    TO authenticated
    USING (true);

-- Ensure RLS is enabled
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Check if policy was created
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS Policies for certificates:';
    RAISE NOTICE '========================================';
END $$;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'certificates'
ORDER BY policyname;

COMMIT;

-- Test the certificate query
SELECT 
    c.id,
    c.certificate_number,
    c.issued_at,
    c.user_id,
    c.course_id,
    c.domain
FROM certificates c
WHERE c.certificate_number = 'LMS-WEB-617336-A0Z';
