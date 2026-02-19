-- Fix ticket_messages: Consolidate is_admin and is_admin_reply columns
-- The issue: Both columns exist, we need to merge them and use only is_admin

DO $$ 
BEGIN
  -- Step 1: Check if both columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_messages' 
    AND column_name = 'is_admin_reply'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_messages' 
    AND column_name = 'is_admin'
  ) THEN
    -- Both columns exist - copy data from is_admin_reply to is_admin
    UPDATE ticket_messages 
    SET is_admin = COALESCE(is_admin_reply, is_admin, FALSE)
    WHERE is_admin_reply IS NOT NULL;
    
    -- Drop the is_admin_reply column
    ALTER TABLE ticket_messages DROP COLUMN is_admin_reply;
    
    RAISE NOTICE 'Merged is_admin_reply into is_admin and dropped is_admin_reply';
    
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_messages' 
    AND column_name = 'is_admin_reply'
  ) THEN
    -- Only is_admin_reply exists - rename it
    ALTER TABLE ticket_messages RENAME COLUMN is_admin_reply TO is_admin;
    RAISE NOTICE 'Renamed is_admin_reply to is_admin';
    
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_messages' 
    AND column_name = 'is_admin'
  ) THEN
    -- Neither exists - create is_admin
    ALTER TABLE ticket_messages ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Created is_admin column';
  ELSE
    RAISE NOTICE 'is_admin column already exists and is correct';
  END IF;

  -- Step 2: Ensure is_admin has proper default
  ALTER TABLE ticket_messages ALTER COLUMN is_admin SET DEFAULT FALSE;
  
  -- Step 3: Update any NULL values to FALSE
  UPDATE ticket_messages SET is_admin = FALSE WHERE is_admin IS NULL;
  
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the fix
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'ticket_messages' 
AND column_name IN ('is_admin', 'is_admin_reply')
ORDER BY column_name;
