-- SQL to remove dummy student "Himanshu Kumar"
-- This cleans up both users and profiles tables

DO $$
DECLARE
    himanshu_id UUID;
BEGIN
    -- 1. Try to find Himanshu in users
    SELECT id INTO himanshu_id FROM users WHERE full_name ILIKE '%Himanshu Kumar%' LIMIT 1;
    
    -- 2. If not found in users, try profiles
    IF himanshu_id IS NULL THEN
        SELECT id INTO himanshu_id FROM profiles WHERE full_name ILIKE '%Himanshu Kumar%' LIMIT 1;
    END IF;

    -- 3. Delete him and his related data if found
    IF himanshu_id IS NOT NULL THEN
        RAISE NOTICE 'Found Himanshu Kumar with ID: %, removing data...', himanshu_id;
        
        -- Related data will be handled by CASCADE if FKs are set, but safer to do explicitly if needed
        -- For this simple cleanup, we target the source tables
        DELETE FROM ticket_messages WHERE user_id = himanshu_id;
        DELETE FROM tickets WHERE user_id = himanshu_id;
        DELETE FROM profiles WHERE id = himanshu_id;
        DELETE FROM users WHERE id = himanshu_id;
        
        RAISE NOTICE 'Himanshu Kumar successfully removed.';
    ELSE
        RAISE NOTICE 'Himanshu Kumar not found in users or profiles.';
    END IF;
END $$;
