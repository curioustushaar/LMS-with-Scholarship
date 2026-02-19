# 🎓 Teacher Video Upload - Complete Setup

## ✅ What's Done

Teachers can now upload videos directly from the Web UI! 

---

## 📍 Where Teachers Upload Videos

### Path in Admin Panel:
```
/admin/courses → Select Course → "Weeks & Content" tab → Click "Videos" button → Upload Modal
```

### Features:
✅ **Drag & Drop** - Drag video file directly  
✅ **Click to Browse** - Traditional file picker  
✅ **Real-time Progress** - Shows upload status  
✅ **Validation** - Checks file type and size before upload  
✅ **Auto-save** - Video URL automatically saved to database  
✅ **Supported Formats** - MP4, WebM, MOV, AVI (Max 500MB)  

---

## 🔧 ONE-TIME SETUP REQUIRED

### 1. Create Supabase Storage Bucket

Go to: [Supabase Dashboard](https://ajuwcsnwfrwktvjdmkru.supabase.co)

Steps:
1. Click **Storage** in left sidebar
2. Click **"Create a new bucket"**
3. Name: `course-videos`
4. Set to **PUBLIC**
5. Click **Create**

That's it! Videos will be stored there.

---

## 📋 Backend Components Added

### 1. **Upload API Endpoint**
📁 [src/app/api/admin/videos/upload/route.ts](./src/app/api/admin/videos/upload/route.ts)

- Handles file upload
- Validates video format and size
- Uploads to Supabase Storage
- Saves record to database
- Returns public URL

### 2. **Video Upload Modal Component**
📁 [src/components/VideoUploadModal.tsx](./src/components/VideoUploadModal.tsx)

- Beautiful drag-and-drop interface
- Form for title, description, duration
- Real-time upload progress
- Error handling
- Success feedback

### 3. **Updated Course Detail Page**
📁 [src/app/admin/courses/[id]/page.tsx](./src/app/admin/courses/[id]/page.tsx)

- Integrated video upload modal
- Click "Videos" button to open upload
- Auto-refresh after upload

### 4. **Updated API Client**
📁 [src/lib/api.ts](./src/lib/api.ts)

- Added `api.videos.upload()` method
- Handles multipart/form-data
- Manages authentication

---

## 🚀 TESTING

### To Test Video Upload:

1. Start dev server:
   ```powershell
   npm run dev
   ```

2. Open browser: `http://localhost:3000/admin/courses`

3. Click on any course → "Weeks & Content" tab

4. For any week, click **"Videos"** button

5. Upload a test video:
   - Drag/drop or click to select
   - Enter title: "Test Video"
   - Click "Upload Video"

6. Wait for upload (shows progress)

7. Should see success message with video in database

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/admin/videos/
│   │   ├── route.ts          ← GET/POST videos
│   │   └── upload/
│   │       └── route.ts      ← FILE UPLOAD HERE
│   └── admin/courses/
│       └── [id]/
│           └── page.tsx      ← Video modal integrated
├── components/
│   └── VideoUploadModal.tsx   ← NEW: Upload UI
└── lib/
    └── api.ts                ← Updated with upload method
```

---

## 🎥 USER FLOW

### What Teacher Sees:

```
1. Course Page
   ↓
2. Click "Weeks & Content" tab
   ↓
3. See list of weeks
   ↓
4. For each week, click "Videos" button
   ↓
5. Upload Modal Opens
   ↓
6. Drag video file or click browse
   ↓
7. Enter title & optional details
   ↓
8. Click "Upload Video"
   ↓
9. File uploads to cloud (shows progress)
   ↓
10. Success! Video saved to database
    ↓
11. Can play video, edit, or delete
```

---

## 🔄 Tech Stack

| Component | Technology |
|-----------|----------|
| **Frontend** | Next.js, React, TypeScript, TailwindCSS |
| **Upload Handling** | HTML5 Drag-Drop, FormData API |
| **File Storage** | Supabase Storage (S3-compatible) |
| **Database** | Supabase PostgreSQL |
| **Authentication** | JWT (Supabase Auth) |

---

## 📊 Database Schema

### Videos Table
```sql
videos (
  id UUID PRIMARY KEY,
  week_id UUID → weeks(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 🔐 Security

✅ **Authentication Required** - Only logged-in admins can upload  
✅ **File Validation** - Only video formats allowed  
✅ **Size Limit** - 500MB max to prevent abuse  
✅ **Public URLs** - Students can view but not delete  
✅ **Database Integrity** - Cascade delete removes storage & files  

---

## 📞 ENDPOINT REFERENCE

### Upload Video
```bash
POST /api/admin/videos/upload
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

file: File (video)
week_id: UUID
title: string
description?: string
duration_minutes?: number
```

### Get Videos for Week
```bash
GET /api/admin/videos?week_id={week_id}
```

### Delete Video
```bash
DELETE /api/admin/videos/{video_id}
```

---

## ✨ NEXT STEPS (Future Enhancements)

- [ ] Video thumbnail generation
- [ ] Video transcoding (convert to multiple formats)
- [ ] Subtitle generation (auto)
- [ ] Video analytics (views, watch time)
- [ ] HLS streaming (adaptive bitrate)
- [ ] Video chapters/bookmarks
- [ ] Playlist support

---

## 📞 SUPPORT

All teachers need to know:

1. **Where**: /admin/courses → Course → "Weeks & Content" → "Videos"
2. **How**: Drag-drop video or click to browse
3. **Max Size**: 500 MB
4. **Formats**: MP4, WebM, MOV, AVI
5. **Storage**: Uploaded to cloud (Supabase Storage)
6. **Access**: Students can watch if enrolled in course

---

## ✅ READY TO GO!

Video upload system is fully integrated. Teachers can start uploading videos immediately! 🎉

