-- Check and fix tickets priority constraint

-- 1. Check current constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'tickets'::regclass
  AND contype = 'c'
  AND conname LIKE '%priority%';

-- 2. Check what priorities exist in the table
SELECT DISTINCT priority 
FROM tickets 
ORDER BY priority;

-- 3. Drop old constraint if it exists
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_priority_check;

-- 4. Add correct constraint that allows 'urgent'
ALTER TABLE tickets 
ADD CONSTRAINT tickets_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 5. Verify the fix
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'tickets'::regclass
  AND contype = 'c'
  AND conname LIKE '%priority%';
