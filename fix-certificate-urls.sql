-- Fix Certificate URLs
-- Generate proper certificate_url for all certificates

BEGIN;

-- Update all certificates with proper certificate URLs
UPDATE certificates 
SET certificate_url = '/certificate/' || certificate_number
WHERE certificate_url IS NULL OR certificate_url = '';

-- Verify
DO $$
DECLARE
    cert_record RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'UPDATED CERTIFICATE URLs';
    RAISE NOTICE '========================================';
    
    FOR cert_record IN
        SELECT 
            certificate_number,
            certificate_url
        FROM certificates
        ORDER BY issued_at DESC
    LOOP
        RAISE NOTICE 'Cert: % -> URL: %', 
            cert_record.certificate_number,
            cert_record.certificate_url;
    END LOOP;
END $$;

COMMIT;

-- Success message
DO $$ BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Certificate URLs fixed!';
    RAISE NOTICE 'All certificates now have proper URLs';
    RAISE NOTICE '========================================';
END $$;
