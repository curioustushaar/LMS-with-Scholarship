# 🚀 Quick Start Guide

## Step 1: Run SQL Schema in Supabase

1. Open your Supabase Dashboard: https://ajuwcsnwfrwktvjdmkru.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents from `supabase-schema.sql`
5. Paste into the SQL editor
6. Click **Run** button

**This will create:**
- ✅ All 15 database tables
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Triggers for auth sync
- ✅ Sample admin user

---

## Step 2: Verify Tables Created

Run this query to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**You should see:**
- badges
- certificates
- courses
- project_deliverables
- project_milestones
- projects
- task_submissions
- tasks
- ticket_messages
- tickets
- user_badges
- users
- video_progress
- videos
- weeks

---

## Step 3: Test the Setup

### Option A: Using Browser (Recommended for Quick Test)

1. Start dev server:
```bash
npm run dev
```

2. Open browser to test endpoints:
```
http://localhost:3001/api/admin/students
http://localhost:3001/api/admin/courses
http://localhost:3001/api/admin/reports/overview
```

Note: You'll get auth error - that's expected. Add this header:
`x-user-id: admin-temp-id`

### Option B: Using Postman/Thunder Client

Create requests with:
- **Base URL:** `http://localhost:3001/api/admin`
- **Header:** `x-user-id: admin-temp-id`
- **Header:** `Content-Type: application/json`

**Test Endpoints:**

1. **Get Students**
   - GET `/students`

2. **Create Student**
   - POST `/students/create`
   - Body:
   ```json
   {
     "email": "test@student.com",
     "full_name": "Test Student",
     "phone": "+91 9876543210"
   }
   ```

3. **Create Course**
   - POST `/courses`
   - Body:
   ```json
   {
     "title": "Web Development Bootcamp",
     "description": "Complete course",
     "level": "beginner",
     "duration_weeks": 12
   }
   ```

4. **Get Overview Report**
   - GET `/reports/overview`

---

## Step 4: Frontend Integration

In your React components:

```typescript
import { api } from '@/lib/api'

// In your component
const fetchData = async () => {
  // Get students
  const students = await api.students.getAll()
  console.log(students)

  // Get overview
  const overview = await api.reports.getOverview()
  console.log(overview)
}
```

---

## Common Issues & Solutions

### Issue: Tables not created
**Solution:** Make sure you're running the SQL in **Supabase SQL Editor**, not in terminal

### Issue: Foreign key errors
**Solution:** Run the ENTIRE schema at once. Don't run table by table.

### Issue: Auth errors on API calls
**Solution:** Add header `x-user-id: admin-temp-id` to all requests

### Issue: CORS errors
**Solution:** Make sure you're calling `/api/admin/...` not full URL with localhost

---

## What Next?

✅ Schema is ready
✅ APIs are working
✅ Now build your admin frontend!

**Connect Pages:**
1. `/admin/students` → Use `api.students.getAll()`
2. `/admin/courses` → Use `api.courses.getAll()`
3. `/admin/tasks` → Use `api.tasks.getAll()`
4. `/admin/dashboard` → Use `api.reports.getOverview()`

---

## File Locations

- **Database Schema:** `supabase-schema.sql`
- **API Client:** `src/lib/api.ts`
- **Auth Helper:** `src/lib/auth.ts`
- **API Routes:** `src/app/api/admin/`
- **Full Documentation:** `API_DOCUMENTATION.md`

---

## 🎯 Quick Reference: All Endpoints

### Students
- GET `/api/admin/students`
- GET `/api/admin/students/:id`
- POST `/api/admin/students/create`
- PATCH `/api/admin/students/:id`

### Courses
- GET `/api/admin/courses`
- POST `/api/admin/courses`
- POST `/api/admin/weeks`
- POST `/api/admin/videos`

### Tasks
- GET `/api/admin/tasks`
- POST `/api/admin/tasks`
- GET `/api/admin/tasks/:id/submissions`
- PATCH `/api/admin/submissions/:id/evaluate`

### Projects
- GET `/api/admin/projects`
- PATCH `/api/admin/projects/:id/approve`
- PATCH `/api/admin/milestones/:id/update`

### Badges
- GET `/api/admin/badges`
- POST `/api/admin/badges`
- POST `/api/admin/users/:id/badges`
- DELETE `/api/admin/users/:id/badges/:badgeId`

### Certificates
- GET `/api/admin/certificates/pending`
- POST `/api/admin/certificates/issue`
- GET `/api/admin/certificates/:id`

### Tickets
- GET `/api/admin/tickets`
- POST `/api/admin/tickets/:id/reply`
- PATCH `/api/admin/tickets/:id/status`

### Reports
- GET `/api/admin/reports/overview`
- GET `/api/admin/reports/student-progress`
- GET `/api/admin/reports/course-analytics`
- GET `/api/admin/reports/activity`

---

## 🎉 Done!

Your complete LMS Admin backend is ready with **35+ API endpoints** and **15 database tables**.

Start building your admin dashboard! 🚀
