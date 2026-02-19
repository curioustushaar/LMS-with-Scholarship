-- Verify ticket_messages table structure and data

-- 1. Check table structure
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'ticket_messages'
ORDER BY ordinal_position;

-- 2. Check existing messages and their is_admin values
SELECT 
  id,
  ticket_id,
  user_id,
  LEFT(message, 50) as message_preview,
  is_admin,
  created_at
FROM ticket_messages
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count admin vs student messages
SELECT 
  is_admin,
  COUNT(*) as message_count
FROM ticket_messages
GROUP BY is_admin;

-- 4. Check if there are any NULL is_admin values (there shouldn't be)
SELECT COUNT(*) as null_is_admin_count
FROM ticket_messages
WHERE is_admin IS NULL;
