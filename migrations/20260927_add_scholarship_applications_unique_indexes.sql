-- Migration: Add unique indexes on scholarship_applications for registration_code and payment_reference
-- Safe to run: 0 duplicate registration_codes or payment_references exist in current production data.

CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_apps_reg_code 
ON public.scholarship_applications (registration_code);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_apps_payment_ref 
ON public.scholarship_applications (payment_reference) 
WHERE payment_reference IS NOT NULL AND payment_reference != '';
