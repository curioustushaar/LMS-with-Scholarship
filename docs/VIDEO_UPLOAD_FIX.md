# Video Upload Fix Guide

## Problem
"Failed to save video record" error when uploading videos. File uploads to storage ✅ but database insert fails ❌

## Root Causes
1. RLS policies might be blocking database inserts
2. Missing permissions on videos table
3. Foreign key constraint issues

## Solution Steps

### Step 1: Run the SQL fix in Supabase Dashboard

1. Go to your Supabase project: https://supabase.com
2. Click **SQL Editor**
3. Click **+ New Query**
4. Paste the contents from `fix-videos-table.sql` (in your project root)
5. Click **Run** (Ctrl + Enter)
6. You should see: ✅ "Videos table fixed!"

### Step 2: Verify Environment Variables

Make sure `.env.local` has all three keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://ajuwcsnwfrwktvjdmkru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_uErYBx7kXXnlX0TS22BhJw...
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl + C)
npm run dev
```

### Step 4: Test Upload

1. Go to `http://localhost:3001/admin/courses/videos`
2. Click a course to expand
3. Click **"🎥 Upload Video"**
4. Select a video file
5. Fill in title (required)
6. Click Upload

### Step 5: Check for Errors

If it still fails:
1. Open browser **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for error messages starting with "Database insert error:"
4. Share those details for further debugging

## New Features Added ✨

### Download Button
- Admin Videos page: **Download** button (green) for each video
- Student Videos page: **Download** button alongside **Watch** button
- Click to download video file directly

### Better Error Logging
- Endpoint now logs detailed information about what's failing
- Helps identify exact problem with database inserts

## File Changes

- `fix-videos-table.sql` - SQL script to fix permissions
- `/src/app/api/admin/videos/upload/route.ts` - Enhanced with better error logging
- `/src/app/admin/courses/videos/page.tsx` - Added download button
- `/src/app/student/videos/page.tsx` - Added download button with proper imports

## Troubleshooting

### Still getting "Failed to save video record"?

Check the console (F12 → Console) for detailed error. Common issues:

1. **"week_id is invalid"** - Selected week doesn't exist. Try creating new week in course.
2. **"relation 'videos' does not exist"** - Run the fix-videos-table.sql file
3. **"permission denied"** - Service role key might be wrong. Check .env.local

### Video uploads to storage but not database?

This means:
- ✅ Storage permissions are working
- ❌ Database permissions need the SQL fix

Always run `fix-videos-table.sql` first!

## Support

If issues persist:
1. Check browser console (F12) for exact error
2. Check server logs (terminal where `npm run dev` is running)
3. Verify all environment variables are correct
4. Run `fix-videos-table.sql` again
