-- Migration: Fix ticket relationships pointing to profiles and refresh schema cache
-- This ensures that the join between tickets and profiles works correctly

-- 1. Ensure foreign key exists for tickets -> profiles (creator)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tickets_user_id_profiles_fkey') THEN
    -- Try to add FK to profiles
    BEGIN
      ALTER TABLE tickets 
      ADD CONSTRAINT tickets_user_id_profiles_fkey 
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add FK to profiles (maybe already exists or table profiles missing)';
    END;
  END IF;
END $$;

-- 2. Ensure foreign key exists for tickets -> profiles (assigned_to)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tickets_assigned_to_profiles_fkey') THEN
    BEGIN
      ALTER TABLE tickets 
      ADD CONSTRAINT tickets_assigned_to_profiles_fkey 
      FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add FK for assigned_to to profiles';
    END;
  END IF;
END $$;

-- 3. Ensure foreign key exists for ticket_messages -> profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_messages_user_id_profiles_fkey') THEN
    BEGIN
      ALTER TABLE ticket_messages 
      ADD CONSTRAINT ticket_messages_user_id_profiles_fkey 
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add FK for ticket_messages user_id to profiles';
    END;
  END IF;
END $$;

-- 4. Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
