-- Debug RLS Permissions
-- Check if RLS is hiding data from the API

DO $$
DECLARE
    vp_rls BOOLEAN;
    prof_rls BOOLEAN;
    policy_rec RECORD;
BEGIN
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'CHECKING RLS STATUS';
    RAISE NOTICE '--------------------------------------------';

    -- Check Video Progress RLS
    SELECT relrowsecurity INTO vp_rls 
    FROM pg_class WHERE relname = 'video_progress';
    
    RAISE NOTICE 'video_progress RLS Enabled: %', vp_rls;

    -- Check Profiles RLS
    SELECT relrowsecurity INTO prof_rls 
    FROM pg_class WHERE relname = 'profiles';

    RAISE NOTICE 'profiles RLS Enabled: %', prof_rls;

    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'EXISTING POLICIES';
    RAISE NOTICE '--------------------------------------------';

    FOR policy_rec IN 
        SELECT tablename, policyname, cmd, roles
        FROM pg_policies 
        WHERE tablename IN ('video_progress', 'profiles', 'users')
    LOOP
        RAISE NOTICE 'Table: % | Policy: % | Cmd: % | Roles: %', 
            policy_rec.tablename, policy_rec.policyname, policy_rec.cmd, policy_rec.roles;
    END LOOP;
END $$;
