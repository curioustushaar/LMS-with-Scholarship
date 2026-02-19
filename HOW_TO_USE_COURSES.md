# How to Add Courses, Weeks, and Videos

## ✅ Status

- ✅ Courses CRUD working
- ✅ View Course Details working (fixed - now loads from API)
- ✅ Weeks API working
- ✅ Videos API working
- ✅ Tasks data from Supabase (not dummy)

---

## 📚 Step 1: Create a Course

1. Go to `/admin/courses`
2. Click **"Create Course"** button
3. Fill in:
   - **Course Name** (required)
   - **Description** (optional)
   - **Duration (weeks)** (e.g., 12)
   - **Level** (beginner/intermediate/advanced)
4. Click **"Create Course"**
5. You'll see it in the courses list

---

## 📖 Step 2: Add Weeks to Course

### Via UI (Click "View Course Details"):

1. Go to `/admin/courses`
2. Click on a course row (or click **View** button)
3. Click **"Weeks & Content"** tab
4. Click **"Add Week"** button
5. Fill in:
   - **Week Number** (1, 2, 3, etc.)
   - **Title** (e.g., "Introduction to Basics")
   - **Description** (optional)
6. Click **"Create Week"**

### Via API (POST /api/admin/weeks):

```bash
curl -X POST http://localhost:3000/api/admin/weeks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "course_id": "course-uuid-here",
    "week_number": 1,
    "title": "Week 1: Getting Started",
    "description": "Introduction and setup"
  }'
```

---

## 🎥 Step 3: Add Videos to Week

### Via UI (Click "Videos" button in Week):

1. Go to Course Details → **"Weeks & Content"**
2. For a week, click **"Videos"** button
3. Click **"Add Video"** button
4. Fill in:
   - **Title** (e.g., "Introduction Video")
   - **Video URL** (link to your video - YouTube, Vimeo, or hosted video)
   - **Duration (minutes)** (optional)
   - **Description** (optional)
5. Click **"Upload Video"**

### Via API (POST /api/admin/videos):

```bash
curl -X POST http://localhost:3000/api/admin/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "week_id": "week-uuid-here",
    "title": "Introduction to Course",
    "video_url": "https://youtube.com/watch?v=...",
    "duration_minutes": 10,
    "description": "Learn the basics"
  }'
```

---

## 📋 Step 4: Create Tasks

1. Go to `/admin/tasks`
2. Click **"Create Task"** button
3. Fill in:
   - **Title** (required)
   - **Description**
   - **Due Date** (optional)
   - **Course** (which course it belongs to)
   - **Max Points** (default: 100)
4. Click **"Create Task"**

Tasks are now pulling real data from Supabase ✅

---

## 📊 View Everything

- **Courses**: `/admin/courses`
- **Course Details**: `/admin/courses/[course-id]`
- **Tasks**: `/admin/tasks`
- **Weeks**: (part of course details)
- **Videos**: (part of course details)

---

## 🔧 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/courses` | Get all courses |
| GET | `/api/admin/courses/:id` | Get single course |
| POST | `/api/admin/courses` | Create course |
| PUT | `/api/admin/courses/:id` | Update course |
| DELETE | `/api/admin/courses/:id` | Delete course |
| GET | `/api/admin/weeks?course_id=X` | Get weeks for course |
| POST | `/api/admin/weeks` | Create week |
| GET | `/api/admin/videos?week_id=X` | Get videos for week |
| POST | `/api/admin/videos` | Create video |
| GET | `/api/admin/tasks` | Get all tasks |
| POST | `/api/admin/tasks` | Create task |

---

## 💡 Tips

- **All timestamps (created_at, updated_at)** are handled automatically by Supabase
- **All data** is pulled from Supabase in real-time
- **Authentication** is required for all endpoints (admin role)
- Use **course_id** and **week_id** as filters when needed

