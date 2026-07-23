# 🚀 Quick Start - Domain-Based Task System

## Prerequisites Checklist
Before using the task system, ensure these are set up:

### 1. Database Tables ✅
Run these in Supabase SQL Editor in order:

```sql
-- 1. Create enrollments table (if not exists)
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 2. Add enrolled_course_ids to users (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS enrolled_course_ids UUID[] DEFAULT '{}';

-- 3. Run the main fix
-- Copy and paste content from: fix-domain-based-tasks.sql
```

### 2. Set Course Domains 🎯
```sql
-- Set domains for your courses
UPDATE courses 
SET domain = 'Web Development' 
WHERE id = 'your-course-uuid';

-- Or bulk update by pattern
UPDATE courses 
SET domain = 'Web Development' 
WHERE title ILIKE '%web%' AND domain IS NULL;
```

### 3. Set Student Domains 👨‍🎓
```sql
-- Set domain for a student
UPDATE users 
SET domain = 'Web Development' 
WHERE id = 'student-uuid' AND role = 'student';
```

### 4. Enroll Students in Courses 📚
```sql
-- Enroll student in course
INSERT INTO enrollments (user_id, course_id)
VALUES ('student-uuid', 'course-uuid')
ON CONFLICT (user_id, course_id) DO NOTHING;
```

## Admin - Create Task

1. Navigate to: `http://localhost:3001/admin/tasks/create`
2. Fill in task details:
   - Title: "Build Portfolio Website"
   - Description: Task description
   - Select Course: (domain auto-inherits from course)
   - Deadline: Pick a date
   - Max Points: 100
3. Click "Create Task"
4. ✅ Task is created with domain from course

## Student - View Tasks

### Using API:
```typescript
// In your student component
const loadTasks = async () => {
  const result = await api.student.tasks.getAll({
    status: 'active'
  })
  
  if (result.success) {
    console.log('My tasks:', result.data)
  }
}
```

### Expected Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid",
      "title": "Build Portfolio Website",
      "deadline": "2026-02-20T23:59:00Z",
      "max_points": 100,
      "courses": {
        "title": "Web Dev Bootcamp",
        "domain": "Web Development"
      },
      "user_submission": null  // or submission object if submitted
    }
  ]
}
```

## Student - Submit Task

```typescript
const submitTask = async (taskId: string) => {
  const result = await api.student.submissions.submit({
    task_id: taskId,
    submission_url: 'https://github.com/username/portfolio',
    submission_text: 'Here is my portfolio website...'
  })
  
  if (result.success) {
    alert('Task submitted successfully!')
  }
}
```

## Admin - View Submissions

1. Navigate to: `http://localhost:3001/admin/tasks/submissions`
2. See all student submissions
3. Filter by status (pending, submitted, reviewed)
4. Grade submissions with feedback

## Common Issues & Solutions

### Issue: "No tasks found for student"
**Check:**
```sql
-- 1. Is student enrolled?
SELECT * FROM enrollments WHERE user_id = 'student-uuid';

-- 2. Does student have domain?
SELECT domain FROM users WHERE id = 'student-uuid';

-- 3. Do courses have matching domain?
SELECT c.title, c.domain 
FROM courses c
JOIN enrollments e ON e.course_id = c.id
WHERE e.user_id = 'student-uuid';

-- 4. Are there active tasks?
SELECT t.title, t.domain, t.status
FROM tasks t
WHERE t.course_id IN (
  SELECT course_id FROM enrollments WHERE user_id = 'student-uuid'
);
```

**Fix:**
```sql
-- Enroll student
INSERT INTO enrollments (user_id, course_id)
VALUES ('student-uuid', 'course-uuid');

-- Set student domain
UPDATE users SET domain = 'Web Development' WHERE id = 'student-uuid';

-- Set course domain
UPDATE courses SET domain = 'Web Development' WHERE id = 'course-uuid';
```

### Issue: "Task domain is NULL"
**Fix:**
```sql
-- Update task domains from courses
UPDATE tasks t
SET domain = c.domain
FROM courses c
WHERE t.course_id = c.id AND c.domain IS NOT NULL;
```

### Issue: "Cannot submit task"
**Check:**
```sql
-- Verify enrollment
SELECT * FROM enrollments 
WHERE user_id = 'student-uuid' AND course_id = (
  SELECT course_id FROM tasks WHERE id = 'task-uuid'
);
```

## Testing Commands

Run these to verify everything works:

```sql
-- 1. Check system health
SELECT
  (SELECT COUNT(*) FROM courses WHERE domain IS NOT NULL) as courses_with_domain,
  (SELECT COUNT(*) FROM tasks WHERE domain IS NOT NULL) as tasks_with_domain,
  (SELECT COUNT(*) FROM users WHERE role='student' AND domain IS NOT NULL) as students_with_domain,
  (SELECT COUNT(*) FROM enrollments) as total_enrollments;

-- 2. View student's tasks
SELECT 
  t.title,
  t.domain,
  c.title as course,
  t.deadline,
  ts.status as submission_status
FROM tasks t
JOIN courses c ON t.course_id = c.id
JOIN enrollments e ON e.course_id = c.id
LEFT JOIN task_submissions ts ON ts.task_id = t.id AND ts.user_id = e.user_id
WHERE e.user_id = 'YOUR-STUDENT-UUID'
  AND t.status = 'active';
```

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/tasks` | POST | Create task |
| `/api/admin/tasks?domain=X` | GET | Get tasks by domain |
| `/api/admin/submissions` | GET | View all submissions |
| `/api/student/tasks` | GET | Get my tasks |
| `/api/student/submissions` | POST | Submit task |
| `/api/student/submissions` | GET | View my submissions |

## Need Help?

1. **Database Issues**: Run `test-domain-tasks.sql` in Supabase
2. **API Errors**: Check browser console and network tab
3. **Full Guide**: See `DOMAIN_BASED_TASKS_GUIDE.md`
4. **Summary**: See `TASK_SYSTEM_FIX_SUMMARY.md`

---

**Quick Links:**
- 📚 Full Guide: [DOMAIN_BASED_TASKS_GUIDE.md](./DOMAIN_BASED_TASKS_GUIDE.md)
- 🔧 Setup Script: [fix-domain-based-tasks.sql](./fix-domain-based-tasks.sql)
- 🧪 Test Script: [test-domain-tasks.sql](./test-domain-tasks.sql)
