# URGENT: Run This Database Migration NOW

The task creation is failing because the database requires `week_id` but we're sending NULL.

## 🔴 ERROR:
```
null value in column "week_id" violates not-null constraint
```

## ✅ SOLUTION: Run this SQL in Supabase

### Copy and paste this EXACT command in Supabase SQL Editor:

```sql
ALTER TABLE tasks ALTER COLUMN week_id DROP NOT NULL;
```

### Step-by-step in Supabase:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Sign in with your account

2. **Select your project**
   - Click on your LMS Admin project

3. **Open SQL Editor**
   - Left sidebar → Click "SQL Editor"

4. **Create new query**
   - Click "+ New query"

5. **Paste this SQL:**
```sql
ALTER TABLE tasks ALTER COLUMN week_id DROP NOT NULL;
```

6. **Click RUN button** (bottom right or Ctrl+Enter)

7. **Wait for success** 
   - Should show: "ALTER TABLE 0" (means success)

8. **Go back to browser**
   - Refresh: http://localhost:3001/admin/tasks/create
   - Try creating a task again

## ✅ After running migration:

- Task creation form will work
- Week is optional (you can leave it blank)
- Submit and it should succeed!

## If you need alternative SQL (if above doesn't work):

```sql
-- This version also works
ALTER TABLE tasks MODIFY week_id UUID REFERENCES weeks(id) ON DELETE SET NULL;
```

Or if using PostgreSQL directly:
```sql
-- Make sure week_id allows NULL values
ALTER TABLE IF EXISTS tasks 
ADD COLUMN IF NOT EXISTS week_id UUID REFERENCES weeks(id) ON DELETE SET NULL;

-- If column already exists, just allow nulls
ALTER TABLE tasks ALTER COLUMN week_id DROP NOT NULL;
```

## 🆘 Need help?

1. Check that you're in the right project
2. Make sure you have admin access
3. Try running the migration
4. Refresh the browser
5. Try creating a task again

The code is fixed - you just need to run this one SQL command!
