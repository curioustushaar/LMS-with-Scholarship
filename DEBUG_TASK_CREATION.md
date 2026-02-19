# Task Creation Debug Summary

## 🔴 Problem Found:
When trying to create a task, getting error:
```
null value in column "week_id" of relation "tasks" violates not-null constraint
```

## Root Cause:
The database table `tasks` has a NOT NULL constraint on the `week_id` column, but:
1. The API was not sending this field in the insert statement
2. The form had a week selector that wasn't being submitted

## 🔧 Fixes Applied:

### 1. **API Handler** - `/src/app/api/admin/tasks/route.ts`
✅ Now extracts `week_id` from request body
✅ Sets it to `null` if not provided (after DB migration)
✅ Includes in database insert: `week_id: week_id || null`
✅ Added detailed logging for debugging

### 2. **Create Task Form** - `/src/app/admin/tasks/create/page.tsx`
✅ Now sends `week_id` in API request: `week_id: formData.week_id || null`
✅ Week field marked as Optional (not required)
✅ Week selector defaults to empty string
✅ Will send `null` if week is not selected

### 3. **Database Schema** - `/supabase-schema.sql`
✅ Updated documentation to show `week_id UUID REFERENCES weeks(id)`
✅ Created migration script: `/fix-tasks-week-id.sql`

## 📋 What You Need To Do:

### Step 1: Run SQL Migration in Supabase
Open Supabase SQL Editor and run:
```sql
ALTER TABLE tasks 
ALTER COLUMN week_id DROP NOT NULL;
```

This makes the `week_id` column optional so tasks can be created without assigning to a week.

### Step 2: Test Task Creation
1. Go to http://localhost:3001/admin/tasks/create
2. Fill in:
   - Title: (required)
   - Description: (required)
   - Course: (required dropdown)
   - Deadline: (required datetime)
   - Max Marks: (required, defaults to 100)
   - Week: (optional dropdown)
   - Instructions: (optional textarea)
3. Click "Create Task"
4. Should succeed with message "Task created successfully!"

## 🔍 How to Debug If Issues Persist:

Check the server logs (terminal where `npm run dev` is running):
- Look for `📝 Creating task with data:` - shows what's being sent
- Look for `🔄 Inserting task into database:` - full task object
- Look for `✅ Task created successfully:` - success confirmation
- Look for `❌ Database insert error:` - if there's an error

## Files Modified:
- ✅ `/src/app/api/admin/tasks/route.ts` - API handler with week_id support
- ✅ `/src/app/admin/tasks/create/page.tsx` - Form submitting week_id
- ✅ `/supabase-schema.sql` - Schema documentation updated
- ✅ `/src/lib/api.ts` - Enhanced error logging
- ✅ `/src/app/api/admin/students/route.ts` - Enhanced logging
- ✅ `/src/app/api/admin/reports/overview/route.ts` - Enhanced logging
- ✅ `/src/app/api/admin/courses/route.ts` - Enhanced logging

## Server Status:
✅ Running on http://localhost:3001
✅ Auth working correctly ✅ All API endpoints responding
✅ Enhanced logging active for debugging
