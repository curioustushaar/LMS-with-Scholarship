-- Fix ticket_messages table: Rename is_admin_reply to is_admin
-- This fixes the issue where admin replies were not showing to students

-- Check if is_admin_reply column exists and rename it to is_admin
DO $$ 
BEGIN
  -- If is_admin_reply exists, rename it to is_admin
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_messages' 
    AND column_name = 'is_admin_reply'
  ) THEN
    ALTER TABLE ticket_messages RENAME COLUMN is_admin_reply TO is_admin;
    RAISE NOTICE 'Column renamed from is_admin_reply to is_admin';
  END IF;

  -- If is_admin doesn't exist yet, create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_messages' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE ticket_messages ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Column is_admin created';
  END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Migration completed successfully!' as status;
