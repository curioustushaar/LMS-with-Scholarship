# 🎬 Video Upload Feature - Quick Start

**Status:** ✅ READY TO USE

Everything is implemented and ready! Just test it following these simple steps.

---

## ⚡ Super Quick Test (2 minutes)

1. **Open browser DevTools:** `F12`
2. **Go to:** `/admin/courses`
3. **Click any course**
4. **Click "Weeks & Content" tab**
5. **Click "Upload" button on any week**
6. **Select a video file** (drag-drop or click)
7. **Fill in title**
8. **Click "Upload Video"**
9. **Wait for success message** ✅

**Done!** Video is now in the system.

---

## 📍 Where Everything Is

### Frontend Components
- **Course Detail Page**: `/src/app/admin/courses/[id]/page.tsx`
  - Shows course weeks
  - Has "Upload" button for each week
  - Displays uploaded videos

- **Upload Modal**: `/src/components/VideoUploadModal.tsx`
  - Drag-drop interface
  - Form fields (title, description, duration)
  - Real-time progress (0-100%)
  - Success/error handling

### Backend APIs
- **Upload Endpoint**: `/src/app/api/admin/videos/upload/route.ts`
  - Accepts multipart/form-data
  - Uploads to Supabase Storage
  - Saves metadata to database

- **API Client**: `/src/lib/api.ts`
  - `api.videos.upload()` - FormData upload
  - `api.videos.getByWeek()` - Get videos per week
  - `api.courses.getById()` - Get course with weeks

---

## 🎯 Features Ready Now

✅ Drag-drop file selection  
✅ Click-to-browse  
✅ File validation (type, size)  
✅ Upload progress indicator  
✅ Form fields (title, description, duration)  
✅ Success confirmation  
✅ Auto-refresh course data  
✅ Persistent storage (Supabase)  
✅ Public video URLs  
✅ Error messages  

---

## 🚨 Need Help?

### "Modal doesn't open"
- Check browser console (F12 → Console)
- Verify course page loaded: look for `API Success: /courses/[id]`
- Refresh page

### "Upload fails"
- Check console for error message
- Verify video format: MP4, WebM, MOV, AVI
- Verify file size: less than 500MB
- Try smaller video file

### "Video doesn't appear"
- Wait 2-3 seconds for page refresh
- Manually refresh page
- Check console for errors

### "See detailed logs"
- Open DevTools: `F12`
- Go to **Console** tab
- All API calls logged there
- Share console output if reporting issues

---

## 🧪 Test with Sample Video

**Option 1: Use existing video**
- Find any `.mp4` file on your computer
- Drag it to upload form

**Option 2: Download sample video** (recommended)
```
https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4
```

**Option 3: Create test video (Linux/Mac):**
```bash
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 \
        -f lavfi -i sine=frequency=1000:duration=10 \
        test.mp4
```

---

## 📋 Implementation Checklist

- [x] Frontend: Course detail page with weeks
- [x] Frontend: Video upload modal with drag-drop
- [x] Frontend: Upload form validation
- [x] Frontend: Progress indicator (0-100%)
- [x] Frontend: Success/error handling
- [x] Frontend: Auto-refresh on success
- [x] Backend: Video upload API endpoint
- [x] Backend: Multipart form-data parsing
- [x] Backend: File validation
- [x] Backend: Supabase Storage upload
- [x] Backend: Database record creation
- [x] Backend: Public URL generation
- [x] API Client: FormData upload method
- [x] API Client: Error logging
- [x] Database: Videos table schema
- [x] Storage: course-videos bucket (PUBLIC)
- [x] Integration: API responses in frontend
- [x] Integration: Modal state management
- [x] Logging: Console debugging enabled
- [x] Documentation: Test guide created

---

## 🚀 Usage Flow

```
Admin Panel
    ↓
Courses & Content
    ↓
Click Course
    ↓
Weeks & Content Tab
    ↓
Click "Upload" Button
    ↓
VideoUploadModal Opens
    ↓
Select Video File (drag/click)
    ↓
Fill Title + Optional Fields
    ↓
Click "Upload Video"
    ↓
Progress Bar (0-100%)
    ↓
Success Message ✅
    ↓
Modal Closes
Course Data Refreshes
    ↓
Video Appears in Week List
    ↓
Students Can Watch Video!
```

---

## 🔍 Verify With DevTools

Open `F12` → **Console** and look for:

**Successful upload sequence:**
```
API Success: /courses/[id]
File dropped: video.mp4 video/mp4 [size]
Starting upload for week: [id]
Upload result: {success: true, data: {...}}
API Success: /courses/[id]
```

Copy-paste any errors from console if reporting issues!

---

## 📞 Support

**Everything is logged to browser console.**  
**Everything has error handling.**  
**Just test it and check console for any issues!**

Use the detailed guide: `VIDEO_UPLOAD_TEST_GUIDE.md`

---

## ✨ What's Next?

After confirming video upload works:

1. ✅ Test uploading multiple videos
2. ✅ Test different video formats
3. ✅ Build student course view
4. ✅ Add video player for students
5. ✅ Track video watch history
6. ✅ Add video analytics

---

**Happy uploading! 🎉**
