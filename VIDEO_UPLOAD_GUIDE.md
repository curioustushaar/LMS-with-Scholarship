# 🎥 VIDEO UPLOAD SYSTEM - COMPLETE GUIDE

## ✅ How Videos Get Uploaded

Videos are uploaded directly to **Supabase Storage** (cloud hosting) and then stored in the database.

---

## 🏗️ ARCHITECTURE

```
Teacher → Web Browser → Next.js API → Supabase Storage → Video Hosted
  ↓            ↓              ↓                ↓              ↓
Upload    File Selected   Upload API      Cloud Storage   Public URL
button    (drag & drop)   Endpoint        (course-videos)  Saved to DB
```

---

## 📋 STEP 1: Enable Supabase Storage (One-time setup)

### 1.1 Go to Supabase Dashboard
- URL: https://ajuwcsnwfrwktvjdmkru.supabase.co
- Click **Storage** in left sidebar

### 1.2 Create Bucket
1. Click **"Create a new bucket"**
2. Name it: `course-videos`
3. Set **Public** mode (so students can view videos)
4. Click **"Create bucket"**

### 1.3 Set Permissions (Optional but recommended)
```sql
-- Run in Supabase SQL Editor if you want RLS policies
CREATE POLICY "Enable public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'course-videos');

CREATE POLICY "Enable public insert access" 
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-videos' AND auth.role() = 'authenticated');
```

---

## 🎬 STEP 2: Teachers Upload Videos

### Via Admin Panel UI:

1. Go to `/admin/courses`
2. Click on any course
3. Click **"Weeks & Content"** tab
4. In any week, click **"Videos"** button
5. Modal opens:
   - **Drag & drop video** or click to browse
   - Enter **Video Title** (required)
   - Enter **Description** (optional)
   - Enter **Duration in minutes** (optional)
6. Click **"Upload Video"**
7. Wait for upload to complete (shows progress)

### Supported Formats:
- ✅ MP4
- ✅ WebM
- ✅ MOV
- ✅ AVI

### Max File Size: 500 MB

---

## 🔗 What Happens Behind the Scenes

### Step-by-Step Flow:

```
1. Teacher selects video file
   ↓
2. Frontend validates:
   - File type is video
   - File size < 500MB
   ↓
3. Send to API: POST /api/admin/videos/upload
   ↓
4. API Handler:
   - Extracts form data (file, weekId, title, etc)
   - Creates unique filename (timestamp + name)
   - Uploads to Supabase Storage → /course-videos/videos/{weekId}/{filename}
   ↓
5. Supabase Storage:
   - Stores file on cloud
   - Returns public URL
   ↓
6. API saves record in database:
   - video_url = public URL from Supabase
   - title, description, duration_minutes stored
   - order_index auto-incremented
   ↓
7. Frontend:
   - Shows success message
   - Refreshes videos list
   - Student can now watch the video
```

---

## 💾 Database Record

When video uploads successfully, this is saved in the `videos` table:

```json
{
  "id": "uuid",
  "week_id": "week-uuid",
  "title": "Introduction to Web Development",
  "description": "Learn the basics",
  "video_url": "https://ajuw...supabase.co/.../video.mp4",
  "duration_minutes": 45,
  "order_index": 0,
  "created_at": "2026-02-06T10:30:00Z",
  "updated_at": "2026-02-06T10:30:00Z"
}
```

---

## 📡 API ENDPOINT DETAILS

### POST /api/admin/videos/upload

**Request:**
```
Content-Type: multipart/form-data

- file: File (video file)
- week_id: string (UUID)
- title: string (required)
- description: string (optional)
- duration_minutes: number (optional)
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "video-uuid",
    "week_id": "week-uuid",
    "title": "Video Title",
    "video_url": "https://...",
    "duration_minutes": 45,
    "created_at": "2026-02-06T10:30:00Z"
  },
  "message": "Video uploaded successfully",
  "url": "https://..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "File size must be less than 500MB",
  "details": "..."
}
```

---

## 🔐 Authentication

- ✅ Only **admin users** can upload videos
- ✅ JWT token required (stored in localStorage)
- ✅ API checks `requireAdmin(request)` before allowing upload

---

## 👀 Viewing Videos

### Teachers can see:
- List of videos in each week
- Video title, duration, upload date
- Option to delete video

### Students can see:
- Videos in their enrolled courses (future feature)
- Play video in built-in player
- Track watch progress

---

## 🗑️ Delete Video

**API Endpoint:** `DELETE /api/admin/videos/:id`

```bash
curl -X DELETE http://localhost:3000/api/admin/videos/video-uuid \
  -H "Authorization: Bearer TOKEN"
```

When deleted:
- ✅ File removed from Supabase Storage
- ✅ Database record deleted
- ✅ All video progress records deleted (cascade)

---

## 🐛 TROUBLESHOOTING

### Issue: "File is too large"
**Solution:** Max 500MB. Compress video or split into parts

### Issue: "Unsupported format"
**Solution:** Use MP4, WebM, MOV, or AVI only

### Issue: "403 Forbidden"
**Solution:** 
- Check JWT token stored in localStorage
- Ensure logged in as admin
- Check Supabase bucket permissions

### Issue: "Failed to upload"
**Solution:**
- Check network connection
- Check Supabase Storage is enabled
- Check bucket exists: `course-videos`
- Check bucket is PUBLIC

### Issue: Video uploaded but shows 404
**Solution:**
- Supabase Storage URL not public
- Video file corrupted during upload
- Try re-uploading

---

## 📊 Storage Usage

You can check storage usage in Supabase:
1. Go to **Storage** → **usage**
2. See total storage used
3. See breakdown by bucket

Supabase free tier: **1 GB storage**
Paid tiers: Up to **1 TB+**

---

## 🔄 Background Jobs (Future)

The system is ready for:
- ✅ Video transcoding (convert to different formats)
- ✅ Thumbnail generation (show preview)
- ✅ Auto-compression for mobile
- ✅ Subtitle generation

---

## 📚 Related Docs

- [HOW_TO_USE_COURSES.md](./HOW_TO_USE_COURSES.md) - Full course management guide
- [SUPABASE_USER_SETUP.md](./SUPABASE_USER_SETUP.md) - User authentication setup

---

## ✅ CHECKLIST

- [ ] Supabase Storage bucket created (`course-videos`)
- [ ] Bucket set to PUBLIC
- [ ] Next.js app running (`npm run dev`)
- [ ] Teacher logged in as admin
- [ ] Course created
- [ ] Week created for course
- [ ] Video uploaded via Web UI
- [ ] Video appears in week
- [ ] Video URL works (can open in browser)

Done! Videos are now uploadable by teachers! 🎉

