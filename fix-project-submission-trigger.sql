-- ==========================================
-- FIX: Project Status Update on Deliverable Submission
-- ==========================================
-- Run this in Supabase SQL Editor

-- 1. Create a function to update project status
CREATE OR REPLACE FUNCTION update_project_status_on_deliverable()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET status = 'submitted',
      updated_at = NOW()
  WHERE id = NEW.project_id
  AND status != 'submitted' AND status != 'approved' AND status != 'rejected';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_project_status_on_deliverable ON project_deliverables;

-- 3. Create the trigger
CREATE TRIGGER trigger_update_project_status_on_deliverable
AFTER INSERT ON project_deliverables
FOR EACH ROW
EXECUTE FUNCTION update_project_status_on_deliverable();

-- 4. Update existing projects that have deliverables but wrong status
UPDATE projects
SET status = 'submitted'
WHERE id IN (
  SELECT DISTINCT project_id 
  FROM project_deliverables
) 
AND (status = 'in_progress' OR status IS NULL);

-- 5. Add RLS Policy for deliverables access (just in case Admin can't see)
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to project_deliverables" ON project_deliverables;

CREATE POLICY "Admin full access to project_deliverables"
ON project_deliverables FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Verify the fix
SELECT id, title, status FROM projects WHERE status = 'submitted';
