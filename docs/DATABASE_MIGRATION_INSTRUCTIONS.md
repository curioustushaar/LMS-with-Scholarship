# Database Migration Instructions

## ⚠️ IMPORTANT: Run This SQL Query

Since we've updated all the code to use the `profiles` table instead of the `users` table, you need to update your database to match.

## Steps:

### 1. Open Supabase Dashboard
Go to your Supabase project → **SQL Editor**

### 2. Run the Migration
Copy and paste the contents of **`MIGRATE_TO_PROFILES_TABLE.sql`** into the SQL Editor and click **RUN**

This migration will:
- ✅ Update all RLS (Row Level Security) policies to use `profiles` instead of `users`
- ✅ Update storage policies
- ✅ Remove old triggers (if any)
- ✅ Verify profiles table structure
- ✅ Provide verification queries

### 3. Data Migration (Optional)
If you have existing data in the `users` table that's NOT in `profiles`:

1. Open `MIGRATE_TO_PROFILES_TABLE.sql`
2. Find section **"5. MIGRATE DATA FROM USERS TO PROFILES"**
3. Uncomment the INSERT query (remove the `/*` and `*/`)
4. Run the migration again

### 4. Test Your Application
After running the migration:

1. **Test Admin Login** - Make sure admin can log in
2. **Test Student Login** - Make sure students can log in
3. **Test Student Creation** - Create a new student from admin panel
4. **Test Course Enrollment** - Enroll a student in a course
5. **Test Student Portal** - Login as student and check courses appear

### 5. Verify in Database
Run these queries to verify everything is working:

```sql
-- Check how many users are in profiles table
SELECT role, account_status, COUNT(*) 
FROM profiles 
GROUP BY role, account_status;

-- Check enrollments are connected properly
SELECT 
  p.full_name,
  c.title,
  e.enrolled_at
FROM enrollments e
JOIN profiles p ON e.user_id = p.id
JOIN courses c ON e.course_id = c.id
LIMIT 10;
```

### 6. Drop Old Users Table (After Testing)
**⚠️ ONLY DO THIS AFTER THOROUGH TESTING!**

Once you've verified everything works for at least a week:

```sql
DROP TABLE IF EXISTS users CASCADE;
```

## What Changed?

### Before (Using `users` table):
```sql
-- Old RLS Policy
EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
```

### After (Using `profiles` table):
```sql
-- New RLS Policy
EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
```

## Field Mappings

| Frontend Field | Database Field (profiles) |
|---------------|--------------------------|
| `status` | `account_status` |
| `phone` | (stored in auth.users.user_metadata) |
| `full_name` | `full_name` |
| `email` | `email` |
| `role` | `role` |
| `profile_image_url` | `profile_image_url` |

## Troubleshooting

### "Column doesn't exist" error
Make sure you ran the migration. It adds missing columns to profiles table.

### "Permission denied" error
RLS policies might not be updated. Re-run the migration.

### Students can't see courses
Check enrollments table is properly connected to profiles:
```sql
SELECT * FROM enrollments WHERE user_id = '<student_id>';
```

### Admin can't access features
Verify admin role in profiles table:
```sql
SELECT * FROM profiles WHERE role = 'admin';
```

## Need Help?
If something goes wrong:
1. Check browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify profiles table has correct data
4. Ensure RLS policies are updated

---

**Status**: ✅ Code is ready | ⏳ Database migration needed
**Next Action**: Run `MIGRATE_TO_PROFILES_TABLE.sql` in Supabase SQL Editor
