-- Check RLS policies for ticket_messages table
-- This ensures students can see admin replies

-- 1. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'ticket_messages';

-- 2. View all policies on ticket_messages
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'ticket_messages';

-- 3. Test query: What would a student see? (Replace user_id with actual student ID)
-- This simulates what the student API would return
SELECT 
  tm.id,
  tm.ticket_id,
  tm.message,
  tm.is_admin,
  tm.created_at,
  p.full_name,
  p.role
FROM ticket_messages tm
LEFT JOIN profiles p ON tm.user_id = p.id
WHERE tm.ticket_id IN (
  SELECT id FROM tickets WHERE user_id = (SELECT id FROM profiles WHERE role = 'student' LIMIT 1)
)
ORDER BY tm.created_at DESC
LIMIT 5;
