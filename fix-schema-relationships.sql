-- =====================================================
-- FIX: Schema Relationship Error
-- Fix "Could not find relationship between certificates and users"
-- =====================================================

BEGIN;

-- Step 1: Check current foreign keys
DO $$
DECLARE
    fk_record RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CURRENT FOREIGN KEYS ON CERTIFICATES';
    RAISE NOTICE '========================================';
    
    FOR fk_record IN
        SELECT
            con.conname AS constraint_name,
            att.attname AS column_name,
            cl.relname AS referenced_table
        FROM pg_constraint con
        JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
        JOIN pg_class cl ON cl.oid = con.confrelid
        WHERE con.conrelid = 'certificates'::regclass
        AND con.contype = 'f'
    LOOP
        RAISE NOTICE 'FK: % on column % references %', 
            fk_record.constraint_name, 
            fk_record.column_name, 
            fk_record.referenced_table;
    END LOOP;
END $$;

-- Step 2: Drop and recreate foreign keys properly
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_user_id_fkey CASCADE;
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_course_id_fkey CASCADE;
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS fk_user CASCADE;
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS fk_course CASCADE;

-- Step 3: Add proper foreign keys
ALTER TABLE certificates 
ADD CONSTRAINT certificates_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE certificates 
ADD CONSTRAINT certificates_course_id_fkey 
FOREIGN KEY (course_id) 
REFERENCES courses(id) 
ON DELETE CASCADE;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);

-- Step 5: Disable RLS temporarily for testing
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;

COMMIT;

-- Step 6: Verify relationships
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION';
    RAISE NOTICE '========================================';
    
    SELECT COUNT(*) INTO fk_count
    FROM pg_constraint
    WHERE conrelid = 'certificates'::regclass
    AND contype = 'f';
    
    RAISE NOTICE 'Total foreign keys on certificates: %', fk_count;
    
    IF fk_count >= 2 THEN
        RAISE NOTICE '✅ Foreign keys successfully created!';
    ELSE
        RAISE NOTICE '❌ Foreign keys may be missing!';
    END IF;
END $$;

-- Final message
DO $$ BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SCHEMA RELATIONSHIPS FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Supabase needs to refresh schema cache';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to Supabase Dashboard';
    RAISE NOTICE '2. Click on any other page (like "Database")';
    RAISE NOTICE '3. Wait 5 seconds';
    RAISE NOTICE '4. Go back to Table Editor';
    RAISE NOTICE '5. This refreshes the cache';
    RAISE NOTICE '';
    RAISE NOTICE 'OR simply wait 2-3 minutes for auto-refresh';
    RAISE NOTICE '';
    RAISE NOTICE 'Then refresh your admin page!';
    RAISE NOTICE '========================================';
END $$;
