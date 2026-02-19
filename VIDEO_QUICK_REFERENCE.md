# Video Upload Feature - Quick Reference

## For Admin - Upload Videos

### Navigate
```
Home → Admin Courses → Click Course → Weeks & Content Tab
```

### Upload Steps
1. Find the week you want to add videos to
2. Click the green "**Upload**" button
3. Drag video file OR click to select
4. Enter title (required)
5. Enter description (optional)
6. Enter duration in minutes (optional)
7. Click "**Upload Video**"
8. Wait for success message
9. Video appears in week list ✅

### Video Requirements
- **Formats**: MP4, WebM, MOV, AVI
- **Max Size**: 500MB
- **Title**: Required
- **Description**: Optional but recommended

---

## For Students - Watch Videos

### Navigate
```
Home → My Videos (or /student/videos)
```

### View Videos Steps
1. See list of your courses (left sidebar)
2. Click a course to view its videos
3. See videos organized by week
4. For each video:
   - **Watch** → Opens in new tab (external player)
   - **Download** → Saves to your device

### What You'll See
- Video title
- Video description
- Duration in minutes
- Date uploaded
- Course and week info

---

## What's Working ✅

| Feature | Status |
|---------|--------|
| Admin upload interface | ✅ Works |
| File upload to cloud | ✅ Works |
| Video saves to database | ✅ Works |
| Student can see videos | ✅ Works |
| Student can watch videos | ✅ Works |
| Student can download videos | ✅ Works |
| Video metadata displays | ✅ Works |
| Error messages | ✅ Clear |

---

## If Videos Don't Show

### Admin Upload Issues
1. Check file size (must be < 500MB)
2. Check file type (.mp4, .webm, .mov, .avi)
3. Check enter video title
4. Check week is created first
5. Look in server logs for "❌ Database insert error:"

### Student Viewing Issues
1. Login as student (not admin)
2. Check you're enrolled in the course
3. Check admin uploaded videos
4. Check course has weeks
5. Try refreshing the page

---

## API Endpoints (For Developers)

### Upload Video
```
POST /api/admin/videos/upload
Content-Type: multipart/form-data

file (required) - The video file
week_id (required) - UUID of the week
title (required) - Video title
description (optional) - Video description
duration_minutes (optional) - Duration
```

### Get Videos By Week
```
GET /api/admin/videos?week_id=<uuid>

Returns:
{
  success: true,
  data: [{ id, title, description, video_url, ... }],
  count: 2
}
```

---

## Server Logs to Look For

### ✅ Success
```
✅ Video uploaded successfully: <video-id>
📝 Creating video
📤 Uploading file to storage
✅ File uploaded to storage
```

### ❌ Errors
```
❌ Database insert error
❌ Storage upload error
❌ File too large
❌ Invalid file type
```

---

## Fixes Applied Today

1. **Column Name Fix**: All endpoints use `order_index` consistently
2. **Admin Permissions**: Endpoints now use admin client with full permissions
3. **Better Logging**: Clear messages in server logs
4. **Error Handling**: Helpful error messages for users

---

## File Locations

### Frontend
- Upload modal: `/src/components/VideoUploadModal.tsx`
- Add video modal: `/src/components/AddVideoModal.tsx`
- Admin view: `/src/app/admin/courses/[id]/page.tsx`
- Student view: `/src/app/student/videos/page.tsx`

### Backend
- Upload endpoint: `/src/app/api/admin/videos/upload/route.ts`
- Video CRUD: `/src/app/api/admin/videos/route.ts`

### API Client
- `/src/lib/api.ts` → `videosAPI` object

---

## Common Questions

**Q: Can students delete videos?**
A: No, only admins can manage videos.

**Q: What video formats work?**
A: MP4, WebM (WebM), MOV, AVI

**Q: What's the max file size?**
A: 500 MB per file

**Q: Can I edit video details after upload?**
A: Not yet - feature planned for future

**Q: Where are videos stored?**
A: Supabase Storage (secure cloud storage)

**Q: Can students download videos?**
A: Yes! Click the download button on /student/videos

**Q: Do videos appear immediately after upload?**
A: Yes, usually within a few seconds

**Q: What if upload fails?**
A: Check file size and type, server logs show exact error

---

## Need Help?

1. **Check server logs** (where `npm run dev` runs)
   - Look for `❌ Database insert error:` or `❌ Storage upload error:`
   
2. **Check browser console** (F12 → Console tab)
   - Look for network errors or JavaScript errors

3. **Check documentation**
   - [VIDEO_UPLOAD_COMPLETE_GUIDE.md](./VIDEO_UPLOAD_COMPLETE_GUIDE.md)
   - [VIDEO_FEATURE_IMPLEMENTATION.md](./VIDEO_FEATURE_IMPLEMENTATION.md)

---

## Environment Check

Make sure in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=set ✓
NEXT_PUBLIC_SUPABASE_ANON_KEY=set ✓
SUPABASE_SERVICE_ROLE_KEY=set ✓
```

Make sure in Supabase:
- Create `course-videos` storage bucket ✓
- Make it public ✓
- `videos` table exists ✓

---

**Last Updated**: February 10, 2026
**Status**: ✅ All Features Working
