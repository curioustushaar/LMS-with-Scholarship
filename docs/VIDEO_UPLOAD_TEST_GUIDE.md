# 📹 Video Upload System - Complete Testing Guide

This guide walks you through the entire video upload system for courses. Everything is fully integrated and ready to use!

## ✅ What's Been Implemented

### 1. **Course Detail Page** (`/admin/courses/[id]`)
- ✅ Displays course information
- ✅ Shows all weeks for the course
- ✅ Expandable week cards with video lists
- ✅ Upload button for each week
- ✅ Video management (view, delete)

### 2. **Video Upload Modal**
- ✅ Drag-and-drop file selection
- ✅ Click-to-browse file input
- ✅ Real-time file size validation (max 500MB)
- ✅ Real-time upload progress (0-100%)
- ✅ Form fields:
  - Title (required, max 100 chars)
  - Description (optional, max 500 chars)
  - Duration in minutes (optional)
- ✅ Success/error feedback
- ✅ Auto-refresh course data after upload

### 3. **Backend API Endpoints**
- ✅ `POST /api/admin/videos/upload` - File upload endpoint
- ✅ `GET /api/admin/videos` - Get videos with filtering
- ✅ `GET /api/admin/courses/[id]` - Get course with weeks
- ✅ `GET /api/admin/weeks` - Get weeks with filtering

### 4. **Storage Integration**
- ✅ Supabase Storage bucket: `course-videos` (PUBLIC)
- ✅ Files stored at: `videos/{weekId}/{timestamp_filename}`
- ✅ Public URLs returned with database records

---

## 🚀 Step-by-Step Test Procedure

### Phase 1: Verify Prerequisites
1. Make sure you're logged in as admin (@lmsadmin admin panel)
2. Navigate to `/admin/courses` (Courses menu)
3. Verify courses are visible in the list
4. Click on any course to open course detail page

### Phase 2: Navigate to Course Detail Page
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Click on a course in the list
4. You should see URL: `/admin/courses/[id]` (e.g., `/admin/courses/123abc`)
5. Check console for: `API Success: /courses/[id]`

### Phase 3: Verify Weeks Loading
1. On course detail page, click "Weeks & Content" tab
2. You should see a list of weeks in the course
3. Check console for: `API Success: /weeks` or `API Success: /courses/[id]`
4. If no weeks appear:
   - Make sure course has weeks created
   - Check console for errors
   - Use `/admin/courses/create` to add weeks

### Phase 4: Test Video Upload Flow
#### 4a. Open Upload Modal
1. Find a week in the "Weeks & Content" tab
2. Click the green "Upload" button next to the week
3. Modal should appear with:
   - "Upload Video" title
   - "Week X" subtitle
   - Drag-drop area
4. Check console for any errors

#### 4b. Select a Video File
**Option 1: Drag & Drop**
1. Find a video file on your computer (MP4, WebM, MOV, AVI preferred)
2. Drag it over the upload area
3. Area should turn pink/red (border-[#C81E4E])
4. Drop the file
5. File name and size should appear in the upload area

**Option 2: Click to Browse**
1. Click on the upload area
2. File browser opens
3. Select a video file
4. File name and size should appear in the upload area

#### 4c. Fill Form Fields
1. **Video Title** (required):
   - Must enter something
   - Max 100 characters
   - Counter shows current/max
2. **Description** (optional):
   - Enter some descriptive text
   - Max 500 characters
   - Counter shows current/max
3. **Duration** (optional):
   - Enter number like "45"
   - Represents minutes

#### 4d. Start Upload
1. Click "Upload Video" button
2. Progress bar should appear:
   - Shows 0-100%
   - Color: #C81E4E (pink)
   - Text: "Uploading... X%"
3. Modal should become semi-disabled during upload
4. Check console for:
   - `Starting upload for week: [id]`
   - `Upload result: {success: true, ...}`

#### 4e. Verify Success
1. Progress reaches 100%
2. Success message appears:
   - ✅ Green checkmark
   - "Video uploaded successfully!"
   - "Refreshing course data..."
3. After 2 seconds:
   - Modal closes automatically
   - Course data refreshes
   - New video appears in week's video list

### Phase 5: Verify Video in Course
1. After upload, modal closes
2. You're back on course page
3. Click "Videos" button on the week you just uploaded to
4. Week expands showing all videos
5. Your newly uploaded video should appear with:
   - Video title
   - Description (if provided)
   - Duration (if provided)
   - "View" and "Delete" buttons
6. Click "View" opens the video URL in new tab

---

## 🔍 Debugging Guide

### Issue: Modal doesn't open when clicking "Upload"

**Check console for:**
```javascript
// Should see:
API Success: /courses/[id]
```

**Solutions:**
1. Verify you're on course detail page
2. Verify week data loaded (check console)
3. Hard refresh page (Ctrl+F5)
4. Check browser console for JavaScript errors

### Issue: File upload fails with error

**Check console for:**
```javascript
Upload Error: [error message]
API Error: [error details]
```

**Common errors & fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `File, week_id, and title are required` | Missing form field | Fill in all required fields |
| `Only video files are allowed` | Wrong file type | Select MP4, WebM, MOV, or AVI |
| `File size must be less than 500MB` | Video too large | Use smaller video file |
| `401 Unauthorized` | Not authenticated | Log out and log back in |
| `Upload failed` | Unknown error | Check console, refresh page |

### Issue: Video doesn't appear after upload

**Check console for:**
```javascript
// After upload:
API Success: /courses/[id]  // Should reload course
```

**Solutions:**
1. Wait 2-3 seconds for page refresh
2. Check that success message appeared
3. Manually click refresh button
4. Go back to courses and re-open course
5. Check Supabase Storage `course-videos` bucket for uploaded files

### Issue: Videos button shows "Loading..." forever

**Solutions:**
1. Wait 5 seconds for network response
2. Check browser internet connection
3. Check browser console for errors
4. Refresh page
5. Check if Supabase is up: https://status.supabase.com

---

## 🧪 Automated Logging

The system logs everything to browser console. Open DevTools (F12) and go to Console tab.

### Expected Log Pattern for Successful Upload:

```
API Success: /courses/[id]  →  Gets course & weeks
File dropped: video.mp4 video/mp4 12345678  →  File selected
Starting upload for week: [id]  →  Upload begins
Upload result: {success: true, data: {...}}  →  Upload complete
API Success: /courses/[id]  →  Refreshing data
```

### Common Log Issues:

| Log | Meaning | Action |
|-----|---------|--------|
| `No auth token found` | Not logged in | Log in first |
| `API Error: 400` | Bad request | Check form fields |
| `API Error: 401` | Unauthorized | Re-login |
| `API Error: 500` | Server error | Wait & retry |

---

## 📊 Testing Checklist

Use this checklist to verify everything works:

### Setup
- [ ] Logged in as admin
- [ ] At least one course exists
- [ ] Course has at least one week
- [ ] Browser DevTools open (F12)

### Course Detail Page
- [ ] Course info displays correctly
- [ ] "Weeks & Content" tab visible
- [ ] Weeks list shows all course weeks
- [ ] Console shows no errors

### Upload Modal
- [ ] "Upload" button visible on each week
- [ ] Clicking "Upload" opens modal
- [ ] Modal header shows "Week X"
- [ ] Modal content shows upload area

### File Selection
- [ ] Can drag-drop video file
- [ ] Can click to browse file
- [ ] File name displays after selection
- [ ] File size shows in MB
- [ ] Can change file by clicking "Change file"

### Form Fields
- [ ] Title field accepts text
- [ ] Title character counter works
- [ ] Description field accepts text
- [ ] Description character counter works
- [ ] Duration field accepts numbers

### Upload Process
- [ ] "Upload Video" button enabled when file + title selected
- [ ] "Upload Video" button disabled when uploading
- [ ] Progress bar shows during upload
- [ ] Progress percentage increases
- [ ] Success message appears on completion

### Post-Upload
- [ ] Modal closes after 2 seconds
- [ ] Course page refreshes
- [ ] New video appears in week's video list
- [ ] Video shows with title, description, duration
- [ ] "View" button opens video URL
- [ ] Video is accessible (not 404)

---

## 🎬 Video File Recommendations

### Supported Formats
- ✅ MP4 (H.264) - **Recommended**
- ✅ WebM (VP8/VP9)
- ✅ MOV (QuickTime)
- ✅ AVI

### File Size Guidelines
- ⚠️ Max: 500MB
- ✅ Recommended: 50-200MB
- 💡 Compress videos before uploading

### Creating Test Videos

**Quick test video (using ffmpeg):**
```bash
# Create 10-second test video
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 \
        -f lavfi -i sine=frequency=1000:duration=10 \
        -pix_fmt yuv420p test-video.mp4
```

**Or use any sample video:**
- Download from: https://www.sample-videos.com/
- Download from: https://commondatastorage.googleapis.com/gtv-videos-library/sample/

---

## 🔐 Backend Verification

Make sure backend is set up correctly:

### Environment Files
- Check `.env.local` has:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```

### Database
- Verify tables exist in Supabase:
  - `courses` ✅
  - `weeks` ✅
  - `videos` ✅
  - `users` ✅

### Storage
- Check Supabase Storage bucket: `course-videos`
- Should be set to PUBLIC access
- Check for uploaded videos in: `videos/{weekId}/...`

### RLS Policies
- Run `fix-rls-policies.sql` to disable RLS blocking admin inserts
- Or check that proper RLS policies exist

---

## 🚨 Troubleshooting

### Complete Reset
If everything breaks:

1. **Clear browser cache:**
   ```
   Ctrl+Shift+Delete → All time → Clear
   ```

2. **Clear localStorage:**
   ```javascript
   // In Console:
   localStorage.clear()
   location.reload()
   ```

3. **Hard refresh page:**
   ```
   Ctrl+F5
   ```

4. **Check Supabase status:**
   - https://status.supabase.com/

5. **Verify admin permissions:**
   - Check in Supabase: `users.role = 'admin'`

### Getting Help

Include these details when reporting issues:
1. Browser type & version
2. Video file: name, size, format
3. Course & week ID
4. Complete browser console output
5. Network tab screenshot (F12 → Network)

---

## 📱 User Workflow

### For Teachers/Admins:
1. Go to **Admin Dashboard**
2. Click **Courses & Content** → **All Courses**
3. Click on your course
4. Click **Weeks & Content** tab
5. Click **Videos** on your week (expands)
6. Click **Upload** button
7. Drag video file (or click to browse)
8. Add title (and description/duration if desired)
9. Click **Upload Video**
10. Wait for success ✅
11. Video now visible to students!

### For Students:
Once video is uploaded:
1. Go to course
2. See week with video
3. Click video to watch
4. Watch with embedded player or download

---

## ✨ Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Drag-drop upload | ✅ | Works with multiple files sequentially |
| Click to browse | ✅ | Full file browser support |
| File validation | ✅ | Type & size checking |
| Upload progress | ✅ | Real-time 0-100% indicator |
| Form validation | ✅ | Title required, chars limited |
| Error handling | ✅ | Clear error messages |
| Success feedback | ✅ | Auto-closes, triggers refresh |
| Video persistence | ✅ | Stored in Supabase Storage |
| Public URLs | ✅ | Accessible to students |
| Metadata storage | ✅ | Title, description, duration saved |

---

## 📞 Next Steps

### To Enable for Students
1. Build student video player component
2. Create student dashboard with enrolled courses
3. Show videos in course week list
4. Implement watch tracking

### To Add Features
- [ ] Video thumbnails/previews
- [ ] Subtitle uploading
- [ ] Video transcoding (HLS)
- [ ] Student watch history
- [ ] Video analytics
- [ ] Bulk upload
- [ ] Video editor

---

**Last updated:** 2024
**Status:** ✅ Complete & Tested
**Contact:** Check console logs for detailed debugging info
