# Task Creation Fix - Database Migration Required

The task creation was failing because the database column `week_id` in the `tasks` table has a NOT NULL constraint, but the API was not sending this value.

## ✅ Code Changes Done:
- Updated API to accept and send `week_id` parameter (optional)
- Updated form to submit `week_id` when available
- Updated database schema documentation

## ⚠️ Database Migration Required:

You need to run this SQL command in your Supabase SQL Editor:

```sql
-- Make week_id optional (allow NULL values)
ALTER TABLE tasks 
ALTER COLUMN week_id DROP NOT NULL;
```

### Steps to run SQL in Supabase:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor" (left sidebar)
4. Create a new query
5. Copy and paste the SQL command above
6. Click "Run"

Or try this alternative if the above fails:

```sql
-- Alternative: Drop and recreate the column
ALTER TABLE tasks DROP COLUMN week_id CASCADE;

ALTER TABLE tasks ADD COLUMN week_id UUID REFERENCES weeks(id) ON DELETE SET NULL;
```

## ✅ After Running Migration:
- Try creating a task again
- Fill in: Title, Description, Course (required), Deadline, Max Marks
- Week is now optional
- Submit and it should work!

## Testing:
1. Login as admin
2. Go to `/admin/tasks/create`
3. Fill the form
4. Click "Create Task"
5. Should see success message and redirect to tasks list

The server is running with all fixes applied and ready to test!
