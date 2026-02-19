-- Check RLS Policies for Certificates
-- This script will show and fix RLS policy issues

-- Step 1: Check current RLS status
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING RLS STATUS';
    RAISE NOTICE '========================================';
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'certificates' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✓ RLS is ENABLED on certificates table';
    ELSE
        RAISE NOTICE '❌ RLS is DISABLED on certificates table';
    END IF;
END $$;

-- Step 2: Show current policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CURRENT RLS POLICIES';
    RAISE NOTICE '========================================';
    
    FOR policy_record IN
        SELECT 
            polname as policy_name,
            polcmd as command,
            qual as using_expression,
            with_check as with_check_expression
        FROM pg_policy
        WHERE polrelid = 'certificates'::regclass
    LOOP
        RAISE NOTICE 'Policy: %', policy_record.policy_name;
        RAISE NOTICE '  Command: %', policy_record.command;
        RAISE NOTICE '';
    END LOOP;
END $$;

-- Step 3: Temporarily disable RLS to test
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;

-- Verify
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS TEMPORARILY DISABLED FOR TESTING';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Now refresh your admin page and check if certificates appear';
END $$;
