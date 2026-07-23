# Video Upload Feature - Complete Guide

## Overview
The LMS system has complete video upload functionality for administrators and video viewing capabilities for students.

## Features Implemented ✅

### Admin Side - Video Upload
- **Location**: `/admin/courses/[id]` → "Weeks & Content" tab
- **Access**: Admin can upload videos for each week of a course
- **Upload Method**: 
  - Direct file upload (drag & drop or file picker)
  - Supports: MP4, WebM, MOV, AVI (max 500MB)
- **Video Details**: Title, Description (optional), Duration (optional)

### Admin Side - Video Management
- View all videos in a week
- Delete videos
- Organize videos by order (order_index)
- Lock/Unlock weeks
- Add new weeks to courses

### Student Side - Video Viewing
- **Location**: `/student/videos`
- **Features**: 
  - View all enrolled courses
  - Browse videos by course and week
  - Watch videos in browser (opens in new tab)
  - Download videos for offline viewing
  - See video metadata (title, description, duration, upload date)

---

## How to Use - Admin (Upload Videos)

### Step 1: Navigate to Course Detail
1. Go to `/admin/courses`
2. Click on a course to open its detail page

### Step 2: Go to Weeks & Content Tab
1. Click on "Weeks & Content" tab
2. You'll see all weeks in the course

### Step 3: Upload Video to a Week
1. For each week, click the green "Upload" button
2. The video upload modal will open

### Step 4: Fill Upload Form
- **Title** (required): Name of the video
- **Description** (optional): Details about the video
- **Duration** (optional): Length in minutes
- **Video File**: Drag & drop or click to select

### Step 5: Submit
1. Click "Upload Video"
2. Monitor progress bar
3. Wait for success message
4. Video automatically appears in the week list

### Expected Success Message
```
Video uploaded successfully!
Refreshing course data...
```

### Troubleshooting

**Error: "File is too large"**
- Maximum file size is 500MB
- Compress your video or split into multiple parts

**Error: "Please select a video file"**
- Ensure file is MP4, WebM, MOV, or AVI format

**Error: "Week ID is missing"**
- Make sure you have created weeks in the course first
- Go to "Weeks & Content" tab and click "Add Week"

**Error: "Internal server error"**
- Check Supabase connection
- Check service role key is set in environment
- Check server logs for detailed error message

---

## How to Use - Student (Watch Videos)

### Step 1: Navigate to Videos Page
1. Login as student
2. Go to `/student/videos` (or via sidebar menu)

### Step 2: Select a Course
1. See list of enrolled courses in left sidebar
2. Click on a course to view its videos

### Step 3: Browse Videos by Week
1. Each week shows its videos in a list
2. See title, description, duration, and upload date

### Step 4: Watch or Download
- **Watch**: Click "Watch" button → opens video in new tab
- **Download**: Click "Download" button → saves to device

---

## Technical Details

### Database Schema - Videos Table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### GET /api/admin/videos
- **Purpose**: Get all videos (optionally filtered by week_id)
- **Parameters**: `?week_id=<uuid>` (optional)
- **Response**: List of videos with metadata

#### POST /api/admin/videos/upload
- **Purpose**: Upload video file and create record
- **Method**: FormData multipart
- **Fields**: 
  - `file` (File, required): Video file
  - `week_id` (string, required): UUID of week
  - `title` (string, required): Video title
  - `description` (string, optional): Video description
  - `duration_minutes` (string, optional): Duration in minutes
- **Response**: Video record with public URL

#### POST /api/admin/videos
- **Purpose**: Create video record with URL (no file upload)
- **Method**: JSON POST
- **Fields**:
  - `week_id` (required): UUID of week
  - `title` (required): Video title
  - `video_url` (required): Public URL to video file
  - `description` (optional): Video description
  - `duration_minutes` (optional): Duration
  - `order` (optional): Order index
- **Response**: Created video record

---

## Fixes Applied in This Session

### 1. Column Name Fix
**Issue**: Code was using both `order` and `order_index` column names inconsistently
**Fix**: Updated all endpoints to use `order_index` consistently

**Files Modified**:
- `/src/app/api/admin/videos/upload/route.ts` ✅
- `/src/app/api/admin/videos/route.ts` ✅

### 2. Admin Client Usage
**Issue**: Video endpoints were using regular Supabase client instead of admin client
**Fix**: Changed to use `supabaseAdmin` with service role key for proper permissions

**Benefits**:
- Bypasses Row-Level Security (RLS) policies
- Proper admin permissions
- Consistent with other admin operations

### 3. Error Handling
**Added**:
- Detailed error logging with codes and hints
- Consistent error response format with `success: false` field
- Proper HTTP status codes
- Stack traces for debugging

### 4. Input Validation
- Validate file types (video/* only)
- Validate file size (max 500MB)
- Validate required fields
- Provide helpful error messages

---

## Environment Setup

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Storage Setup
Ensure `course-videos` storage bucket exists in Supabase:
1. Go to Supabase Dashboard
2. Storage → Create new bucket
3. Name: `course-videos`
4. Make public: Yes (for public viewing)

---

## Server Logs for Debugging

When uploading a video, check server terminal for logs like:

```
📝 Starting video upload: { fileName: 'lecture1.mp4', fileSize: 52428800, weekId: '...', title: 'Introduction' }
📤 Uploading file to storage: { filepath: 'videos/week-id/timestamp_lecture1.mp4' }
✅ File uploaded to storage, URL: https://...
📝 Inserting video record: { week_id: '...', title: 'Introduction', ... }
✅ Video uploaded successfully: video-id-uuid
```

### Error Example
```
❌ Database insert error: {
  message: "Could not find the '...' column",
  code: "...",
  details: "...",
  hint: "..."
}
```

---

## Complete Workflow Example

### Admin: Upload Video
1. Navigate to `/admin/courses/abc123`
2. Click "Weeks & Content" tab
3. Find "Week 1: Introduction" section
4. Click green "Upload" button
5. Drag lecture-video.mp4 into upload area
6. Enter title: "Welcome to the Course"
7. Enter description: "Course overview and objectives"
8. Enter duration: 15
9. Click "Upload Video"
10. See success message
11. Video appears in week's video list

### Student: Watch Video
1. Login as student
2. Navigate to `/student/videos`
3. Click "Web Development" course in sidebar
4. Find "Week 1: Introduction" section
5. See "Welcome to the Course" video listed
6. Click blue "Watch" button
7. Video player opens in new tab
8. Or click "Download" to save file

---

## Testing Checklist

- [ ] Can upload video to course week (admin)
- [ ] Video appears in week list after upload (admin)
- [ ] Can view video metadata in admin panel
- [ ] Can delete video from week (admin)
- [ ] Student can see enrolled courses
- [ ] Student can see videos in courses
- [ ] Student can watch videos (opens in new tab)
- [ ] Student can download videos
- [ ] Video duration shows correctly
- [ ] Video description displays properly
- [ ] Error messages are helpful
- [ ] Page loads without 500 errors
- [ ] Storage URL is valid and public
- [ ] Videos ordered by order_index

---

## Support

If videos aren't showing up:
1. Check admin upload logs in server terminal
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Ensure `course-videos` storage bucket exists
4. Check that weeks exist before uploading videos
5. Verify student is enrolled in the course
6. Check browser console for any fetch errors

For more help, check the server logs for "❌ Database insert error:" messages that show the exact issue.
