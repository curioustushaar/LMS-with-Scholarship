# 🎬 Video Upload Feature - User Instructions

## ⚡ Quick Reference - Upload Video in 3 Steps

### Step 1: Open Course
- Go to Admin Dashboard
- Click **Courses & Content** → **All Courses**
- Click the course where you want to upload a video

### Step 2: Open Upload
- Click **Weeks & Content** tab
- Find the week you want to add video to
- Click the green **Upload** button

### Step 3: Upload
- Drag video file into the box (or click to browse)
- Fill in the video **Title** (required)
- Click **Upload Video**
- Watch the progress bar
- See ✅ success message
- Done! Video is now in your course

---

## 📋 Detailed Instructions

### 1. Navigate to Courses
```
Admin Dashboard
    ↓
Left Sidebar: Courses & Content
    ↓
All Courses
```

You'll see a list of all courses.

### 2. Open Your Course
Click on the course where you want to add videos.

This opens the **Course Detail Page** showing:
- Course name and description
- Course level and duration
- 3 tabs: "Course Info", "Weeks & Content", "Enrolled Students"

### 3. Go to Weeks & Content Tab
Click the **"Weeks & Content"** tab (middle tab).

You'll see all weeks in your course listed as cards.

### 4. Find Your Week
Look through the weeks list for the week where you want to add a video.

Each week card shows:
- Week number and title (e.g., "Week 1: Introduction")
- Status: Locked ❌ or Unlocked ✅
- 5 buttons: [Lock/Unlock] [Videos] [Upload] [Edit] [Delete]

### 5. Click Upload Button
Click the green **Upload** button on your week.

A modal (popup) will open with the title "Upload Video".

### 6. Select Your Video File

**Option A: Drag & Drop (Easiest)**
1. Find your video file on your computer
2. Drag it over the gray dotted area
3. Area will turn pink/red when you drag over it
4. Drop the file
5. You'll see the filename and file size

**Option B: Click to Browse**
1. Click anywhere in the gray dotted area
2. A file browser / file picker opens
3. Navigate to your video file
4. Select it and click "Open"
5. You'll see the filename and file size

### 7. Fill in Video Details

**Title** (Required - must enter something)
- Examples: "Introduction to React", "Module 1 Basics", "Lecture 3"
- Maximum 100 characters
- You'll see a counter showing: "Current/100"

**Description** (Optional - can skip)
- Add details about the video
- Examples: "Learn the basics of React hooks", "This lecture covers..."
- Maximum 500 characters
- You'll see a counter showing: "Current/500"

**Duration** (Optional - can skip)
- How many minutes long is the video?
- Examples: "45", "120", "15"
- Just the number, no "minutes" text needed

### 8. Click Upload Button
Once you have:
- ✅ Selected a video file
- ✅ Entered a title

The **"Upload Video"** button becomes active (clickable).

Click it to start uploading.

### 9. Watch the Progress
While uploading:
- You'll see a pink/red progress bar
- Shows percentage: "Uploading... 25%"
- This can take 30 seconds to 2 minutes depending on file size
- The form inputs will be disabled
- Cancel button will also be disabled

Wait for it to complete.

**Don't close the browser or navigate away during upload!**

### 10. See Success Message ✅
When done, you'll see:

```
✅ Video uploaded successfully!
   Refreshing course data...
```

The modal will automatically close after 2 seconds.

### 11. Video Appears in Course
You're back on the course page.

Click the **Videos** button on your week to see the list of videos.

Your new video will be at the top of the list with:
- Video title
- Description (if you added one)
- Duration (if you added it)
- Two buttons: "View" and "Delete"

**Click "View"** to watch your video or verify it's working.

---

## ❌ Troubleshooting

### "Upload button is greyed out"
**Reason:** You haven't selected a video file OR haven't entered a title

**Fix:**
1. Make sure you selected a video file (see filename in upload area)
2. Make sure you entered text in the "Video Title" field
3. Then click Upload button again

### "Error: Only video files allowed"
**Reason:** You selected a non-video file (image, document, etc.)

**Fix:**
1. Make sure you're selecting a video file
2. Supported formats: MP4, WebM, MOV, AVI
3. Don't select images, PDFs, or other file types

### "Error: File size must be less than 500MB"
**Reason:** Your video is too large

**Fix:**
1. Use a smaller/shorter video
2. Compress your video using:
   - Online tool: https://www.compressvideo.io/
   - Software: HandBrake (free)
   - Command line: ffmpeg

### "Upload stuck on X% or takes very long"
**Reason:** Large file or slow internet

**Fix:**
1. Wait - large videos take time (minutes are normal)
2. Check your internet speed
3. Try uploading in a room with better WiFi
4. Try a smaller video file first

### "Success message didn't appear"
**Reason:** Upload might have completed silently or network issue

**Fix:**
1. Wait a few seconds
2. If still nothing, refresh the page: press F5
3. Go back to Weeks tab
4. Check if your video appears in the list

### "Can't see modal when I click Upload"
**Reason:** Browser issue or page didn't load properly

**Fix:**
1. Refresh page: F5 or Ctrl+R
2. Clear browser cache: Ctrl+Shift+Delete
3. Log out and log back in
4. Try different browser

### "Video doesn't appear after upload"
**Reason:** Might need to refresh the page

**Fix:**
1. Wait 2-3 seconds (page auto-refreshes)
2. Click **Videos** button on the week to expand it
3. If still missing, manually refresh: F5
4. If after refresh still missing, check console (F12) for errors

---

## 📱 Requirements

### Browser
- Chrome (recommended)
- Firefox
- Edge
- Safari
- Any modern browser from last 2 years

### Internet
- Upload speed: 1MB/s minimum
- Stable connection (don't use on weak WiFi)

### Video File
- Format: MP4, WebM, MOV, AVI
- Size: Less than 500MB
- Examples:
  - 10-minute video: ~50-100MB
  - 30-minute video: ~200-400MB
  - 60-minute video: ~500MB+

### Computer Permissions
- Drive with 500MB free space
- Ability to select files from computer

---

## 🎥 Creating/Preparing Videos

### If you don't have a video yet:

**Record a video:**
1. Use OBS Studio (free): https://obsproject.com/
2. Use Camtasia: https://www.camtasia.com/
3. Use Zoom's recording feature
4. Use your smartphone camera
5. Screen record with computer

**Use existing videos:**
1. YouTube: Record with ScreenFlow or OBS while playing
2. Download samples: https://www.sample-videos.com/
3. Create with PowerPoint or Keynote
4. Use stock footage: https://pixabay.com/videos/

### Compressing videos:

**Online tools (easiest, no download needed):**
1. https://www.compressvideo.io/
2. https://www.freeconvert.com/video-compressor
3. https://online-convert.com/

**Desktop software (more control):**
1. HandBrake (free): https://handbrake.fr/
2. ffmpeg (open source)
3. Adobe Media Encoder (paid)

**Command line (if you know ffmpeg):**
```bash
# Reduce file size:
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4

# Change resolution:
ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4

# Reduce bitrate:
ffmpeg -i input.mp4 -b:v 2000k output.mp4
```

---

## 💡 Tips & Best Practices

### Before Uploading
1. ✅ Test that your video plays on your computer first
2. ✅ Compress if file is over 200MB
3. ✅ Check that audio works
4. ✅ Make sure video is properly named

### When Describing
1. ✅ Use clear title: "Introduction to React" not "vid1"
2. ✅ Add description for longer videos
3. ✅ List key topics in description
4. ✅ Include duration if > 30 minutes

### For Students
1. ✅ Keep videos under 20 minutes when possible
2. ✅ Start each video with clear intro
3. ✅ Use good audio quality
4. ✅ Test that students can access (click View button)

### Common File Sizes
- 5-minute video: 25-50MB
- 10-minute video: 50-100MB
- 15-minute video: 75-150MB
- 30-minute video: 150-300MB
- 60-minute video: 300-500MB

---

## ✅ Video Upload Checklist

Before clicking Upload:

- [ ] Video file selected (can see filename)
- [ ] Video title entered (required)
- [ ] Video format is MP4, WebM, MOV, or AVI
- [ ] File size less than 500MB
- [ ] Good internet connection
- [ ] Browser is up to date
- [ ] You have 5-10 minutes free (upload time)
- [ ] You're logged in as admin

---

## 🆘 Getting Help

### If Something Goes Wrong

1. **Check browser console** (this shows detailed errors):
   - Press: F12
   - Click: Console tab
   - Look for any red error messages
   - Copy the error text

2. **Try these fixes first:**
   - Refresh page: F5
   - Clear cache: Ctrl+Shift+Delete
   - Log out and log back in
   - Try different browser
   - Try different file/smaller file

3. **Contact support with:**
   - What you were trying to do
   - File name and size
   - Error message from console (if any)
   - Browser type and version
   - Screenshot if possible

---

## 📖 More Information

For detailed information, see:
- **QUICK_VIDEO_START.md** - Technical overview
- **VIDEO_UPLOAD_TEST_GUIDE.md** - Complete testing guide
- **SYSTEM_SUMMARY.md** - Architecture details

---

## 🎓 FAQ

**Q: How large can the video be?**  
A: Maximum 500MB. Compress for smaller files.

**Q: How long does upload take?**  
A: 30 seconds to 5 minutes depending on file size and internet speed.

**Q: Can I upload multiple videos?**  
A: Yes! Upload one at a time. After one finishes, click Upload again.

**Q: Can I delete a video?**  
A: Yes! Click "Delete" button on the video in the list.

**Q: Can I edit video details after uploading?**  
A: Not yet, but can delete and re-upload.

**Q: What video formats work?**  
A: MP4 (best), WebM, MOV, AVI

**Q: Can students download videos?**  
A: Yes, videos are stored in Supabase Storage (publicly accessible).

**Q: Where are videos stored?**  
A: Supabase Storage cloud (backed up, secure)

**Q: Can I see upload progress?**  
A: Yes! Progress bar shows 0-100% during upload.

**Q: What if upload fails?**  
A: Error message appears. Try again with different file or check file size/type.

**Q: Can students see videos immediately?**  
A: Yes! Right after upload completes and page refreshes.

---

## 🎯 Next Steps

1. ✅ Go to `/admin/courses`
2. ✅ Click your course
3. ✅ Go to Weeks & Content tab
4. ✅ Click Upload button
5. ✅ Upload your first video!

**That's it! You're done!**

---

**Questions?** Check the console (F12) for detailed error messages.

**Ready?** Let's upload your video! 🚀
