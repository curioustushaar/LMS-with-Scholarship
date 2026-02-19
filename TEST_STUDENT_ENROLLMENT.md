# Testing Student Enrollment & Projects - Debug Guide

## Current Status
✅ Student Created: Ankit kumar gupta (roybabu1452@gmail.com)
✅ Enrolled in Course: robotics (2/17/2026)
✅ Project Assigned: Robotics (Status: IN PROGRESS, Deadline: 2/19/2026)
✅ Admin Panel: Can see enrollment & project

## IMPORTANT: Run SQL Fix First! ⚠️

**Before testing, run this SQL file in Supabase SQL Editor:**

📄 **File:** `FIX-ALL-STUDENT-ACCESS.sql`

This file fixes BOTH:
- ✅ Course enrollments access
- ✅ Projects access

**Steps:**
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy entire content of `FIX-ALL-STUDENT-ACCESS.sql`
4. Click **Run** or press `Ctrl+Enter`
5. Wait for success message

---

## Test Steps

### 1️⃣ Login as Student
1. Logout from admin panel
2. Go to: http://localhost:3001/login
3. Login with:
   - Email: roybabu1452@gmail.com
   - Password: [the password admin set during creation]

### 2️⃣ Check Enrolled Courses
Navigate to: http://localhost:3001/student/courses

**Expected Result:** ✅
- Should see **"robotics"** course card
- Course details: 8 weeks, Advanced level
- Enrollment date: 2/17/2026
- "Watch Videos" and "View Projects" buttons

### 3️⃣ Check Assigned Projects
Navigate to: http://localhost:3001/student/projects

**Expected Result:** ✅
- Should see **"Robotics"** project card
- Status: IN PROGRESS
- Course: robotics
- Deadline: 2/19/2026
- Project UUID: afda7036-d9ff-4a8c-9e40-4a0ba3b89a38

### 4️⃣ Test APIs Directly (Browser Console - F12)

**Check Enrolled Courses API:**
```javascript
fetch('/api/student/courses')
  .then(r => r.json())
  .then(data => console.log('📚 My Courses:', data))
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "c0be5e51-8cb4-4244-ae66-71234652443f",
      "title": "robotics",
      "duration_weeks": 8,
      "level": "Advanced",
      "enrolled_at": "2026-02-17..."
    }
  ]
}
```

**Check Projects API:**
```javascript
fetch('/api/student/projects')
  .then(r => r.json())
  .then(data => console.log('📁 My Projects:', data))
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "afda7036-d9ff-4a8c-9e40-4a0ba3b89a38",
      "title": "Robotics",
      "status": "in_progress",
      "deadline": "2026-02-19...",
      "courses": {
        "title": "robotics"
      }
    }
  ],
  "count": 1
}
```

### 5️⃣ Verify in Database (Supabase SQL Editor)

**Check Enrollments:**
```sql
SELECT 
  e.id,
  u.email,
  c.title as course_title,
  e.enrolled_at
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE u.email = 'roybabu1452@gmail.com';
```

**Expected:** 1 row with robotics course

**Check Projects:**
```sql
SELECT 
  p.id,
  p.title,
  p.status,
  u.email,
  c.title as course_title,
  p.deadline
FROM projects p
JOIN users u ON p.user_id = u.id
LEFT JOIN courses c ON p.course_id = c.id
WHERE u.email = 'roybabu1452@gmail.com';
```

**Expected:** 1 row with Robotics project

---

## Troubleshooting

### ❌ Problem: No courses showing
**Debug Steps:**
1. Run `FIX-ALL-STUDENT-ACCESS.sql` in Supabase
2. Check browser console for errors (F12)
3. Test API directly (see 4️⃣ above)
4. Verify enrollment exists in database (5️⃣)

### ❌ Problem: No projects showing
**Debug Steps:**
1. Run `FIX-ALL-STUDENT-ACCESS.sql` in Supabase
2. Check projects API response (F12 console)
3. Verify project exists in database
4. Check if RLS policies are applied

### ❌ Problem: "Unauthorized" error
**Solution:**
- Run `FIX-ALL-STUDENT-ACCESS.sql`
- This fixes RLS policies for both enrollments and projects

### ❌ Problem: API returns empty data
**Possible Causes:**
- RLS policies not applied → Run SQL file
- Student not logged in properly
- Data not created in admin panel

---

## Data Flow - How It Works

### **Course Enrollment Flow:**
```
Admin Creates Student + Selects Course
          ↓
API: POST /api/admin/students/create
          ↓
Database: INSERT into enrollments
  {
    user_id: [student UUID] → users.id
    course_id: [course UUID] → courses.id
  }
          ↓
Student Logs In
          ↓
Frontend: /student/courses page
          ↓
API: GET /api/student/courses
          ↓
Query: SELECT * FROM enrollments 
       WHERE user_id = auth.uid()
       JOIN courses...
          ↓
Display: Course cards shown ✅
```

### **Project Assignment Flow:**
```
Admin Assigns Project to Student
          ↓
API: POST /api/admin/projects
          ↓
Database: INSERT into projects
  {
    user_id: [student UUID] → users.id
    course_id: [course UUID] → courses.id
    title: "Robotics"
    status: "in_progress"
  }
          ↓
Student Logs In
          ↓
Frontend: /student/projects page
          ↓
API: GET /api/student/projects
          ↓
Query: SELECT * FROM projects 
       WHERE user_id = auth.uid()
       JOIN courses...
          ↓
Display: Project cards shown ✅
```

---

## Success Criteria
✅ Student can login with credentials
✅ `/student/courses` shows robotics course
✅ `/student/projects` shows Robotics project
✅ Both APIs return correct data
✅ Course details display correctly
✅ Project details display correctly
✅ Can submit project (update project_url)

## Files Modified
- ✅ `/src/app/api/student/courses/route.ts` - Courses API
- ✅ `/src/app/api/student/projects/route.ts` - **FIXED** Projects API
- ✅ `/src/app/student/courses/page.tsx` - Courses UI
- ✅ `/src/app/student/projects/page.tsx` - Projects UI (existing)
- ✅ `/src/lib/api.ts` - API client methods
- ✅ `FIX-ALL-STUDENT-ACCESS.sql` - **RUN THIS FIRST!**
- ✅ `fix-student-enrollment-access.sql` - Enrollments only
- ✅ `fix-student-projects-access.sql` - Projects only
