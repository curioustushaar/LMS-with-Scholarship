-- ==========================================
-- DEBUG: Inspect project_deliverables Schema
-- ==========================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_deliverables' 
ORDER BY ordinal_position;
