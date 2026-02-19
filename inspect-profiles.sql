-- Inspect Profiles Table Schema
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '--------------------------------------------';
    RAISE NOTICE 'INSPECTING PROFILES TABLE';
    RAISE NOTICE '--------------------------------------------';
    
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: %', 
            col_record.column_name, col_record.data_type, col_record.is_nullable;
    END LOOP;
END $$;
