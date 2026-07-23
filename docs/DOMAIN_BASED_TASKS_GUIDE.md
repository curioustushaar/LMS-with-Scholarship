# Domain-Based Task System - Complete Guide

## Overview
This system implements domain-based task filtering, allowing:
- **Admins**: Create tasks that are automatically filtered by domain based on the course
- **Students**: View only tasks from courses they're enrolled in and that match their domain
- **Submissions**: Students can submit tasks and track their submission status

## Database Changes Applied

### 1. Tasks Table
- Added `domain` column to store task domain (inherited from course)
- Added indexes for performance (`idx_tasks_domain`, `idx_tasks_course_id`, `idx_tasks_status`)

### 2. Users Table  
- Uses existing `domain` column for student domain filtering
- Uses `enrolled_course_ids` array for efficient course filtering

### 3. Task Submissions Table
- Added indexes for better query performance
- Supports tracking submission status, points, and feedback

## API Endpoints

### Admin Endpoints

#### POST /api/admin/tasks
Create a new task (domain is automatically inherited from the course)

**Request:**
```json
{
  "title": "Build Portfolio Website",
  "description": "Create a personal portfolio",
  "course_id": "uuid-of-course",
  "week_id": "uuid-of-week",  // optional
  "due_date": "2026-02-20T23:59:00",
  "max_points": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Build Portfolio Website",
    "domain": "Web Development",  // Inherited from course
    ...
  }
}
```

#### GET /api/admin/tasks
Get all tasks with optional domain filtering

**Query Parameters:**
- `status`: Filter by task status (active, inactive, archived)
- `course_id`: Filter by course
- `domain`: Filter by domain

**Example:**
```
GET /api/admin/tasks?domain=Web Development&status=active
```

### Student Endpoints

#### GET /api/student/tasks
Get tasks for authenticated student (automatically filtered by enrollment and domain)

**Query Parameters:**
- `course_id`: Filter by specific course (optional)
- `status`: Filter by status (default: 'active')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid",
      "title": "Build Portfolio Website",
      "description": "...",
      "deadline": "2026-02-20T23:59:00",
      "max_points": 100,
      "courses": {
        "title": "Web Development Bootcamp",
        "domain": "Web Development"
      },
      "user_submission": {
        "id": "submission-uuid",
        "status": "submitted",
        "points_awarded": 0,
        "submitted_at": "2026-02-11T10:00:00"
      }
    }
  ],
  "count": 1
}
```

#### POST /api/student/submissions
Submit a task solution

**Request:**
```json
{
  "task_id": "uuid-of-task",
  "submission_url": "https://github.com/username/portfolio",
  "submission_text": "Here is my portfolio website..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "task_id": "uuid-of-task",
    "user_id": "uuid-of-student",
    "submission_url": "https://github.com/username/portfolio",
    "status": "submitted",
    "submitted_at": "2026-02-11T10:00:00"
  },
  "message": "Task submitted successfully"
}
```

#### GET /api/student/submissions
Get all submissions for authenticated student

**Query Parameters:**
- `task_id`: Filter by specific task (optional)
- `status`: Filter by status (optional)

## Frontend Usage

### Admin - Creating Tasks

```typescript
import { api } from '@/lib/api'

const createTask = async () => {
  const result = await api.tasks.create({
    title: 'Build a Portfolio Website',
    description: 'Create your personal portfolio',
    course_id: courseId,
    due_date: new Date('2026-02-20').toISOString(),
    max_points: 100
  })

  if (result.success) {
    console.log('Task created:', result.data)
    // Domain is automatically inherited from course
  }
}
```

### Admin - Viewing Tasks by Domain

```typescript
import { api } from '@/lib/api'

const loadTasks = async (domain: string) => {
  const result = await api.tasks.getAll({ 
    domain: domain,
    status: 'active' 
  })

  if (result.success) {
    console.log('Tasks:', result.data)
  }
}
```

### Student - Viewing Tasks

```typescript
import { api } from '@/lib/api'

const loadMyTasks = async () => {
  const result = await api.student.tasks.getAll({
    status: 'active'
  })

  if (result.success) {
    console.log('My tasks:', result.data)
    // Only shows tasks from enrolled courses matching student's domain
  }
}
```

### Student - Submitting Task

```typescript
import { api } from '@/lib/api'

const submitTask = async (taskId: string, githubUrl: string) => {
  const result = await api.student.submissions.submit({
    task_id: taskId,
    submission_url: githubUrl,
    submission_text: 'My portfolio is complete!'
  })

  if (result.success) {
    console.log('Submitted:', result.data)
  }
}
```

### Student - Viewing Submissions

```typescript
import { api } from '@/lib/api'

const loadMySubmissions = async () => {
  const result = await api.student.submissions.getAll()

  if (result.success) {
    console.log('My submissions:', result.data)
  }
}
```

## Database Setup Instructions

### Step 1: Run Migration SQL
Execute the following SQL file in your Supabase SQL Editor:

```
fix-domain-based-tasks.sql
```

This will:
- Add domain column to tasks table
- Create all necessary indexes
- Set up helper functions
- Sync existing task domains from courses

### Step 2: Verify Setup
After running the migration, verify the setup:

```sql
-- Check if domain column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'domain';

-- Check if tasks have domains
SELECT 
  t.id, 
  t.title, 
  t.domain,
  c.domain as course_domain
FROM tasks t
LEFT JOIN courses c ON t.course_id = c.id
LIMIT 5;
```

### Step 3: Update Existing Data
If you have existing tasks without domains:

```sql
-- Update tasks to inherit domain from their course
UPDATE tasks t
SET domain = c.domain
FROM courses c
WHERE t.course_id = c.id
  AND t.domain IS NULL
  AND c.domain IS NOT NULL;
```

## Testing the System

### Test 1: Admin Creates Task
1. Login as admin
2. Go to `/admin/tasks/create`
3. Select a course (with domain set)
4. Create task
5. Verify task has domain from course

### Test 2: Student Views Tasks
1. Login as student with domain "Web Development"
2. Ensure student is enrolled in courses
3. Call `/api/student/tasks`
4. Verify only tasks from enrolled courses are shown
5. Verify only tasks matching student's domain are shown

### Test 3: Student Submits Task
1. Login as student
2. Select a task
3. Submit with URL or text
4. Verify submission is created
5. Check `/api/student/submissions` to see submission

### Test 4: Admin Views Submissions
1. Login as admin
2. Go to `/admin/tasks/submissions`
3. Verify student submission appears
4. Evaluate submission with points and feedback

## Troubleshooting

### Issue: Tasks don't show domain
**Solution:** Make sure courses have domain set first
```sql
UPDATE courses SET domain = 'Web Development' WHERE domain IS NULL;
```

### Issue: Student can't see any tasks
**Checklist:**
1. Is student enrolled in courses?
2. Does student have a domain set?
3. Do courses have domains matching student's domain?
4. Are tasks status = 'active'?

### Issue: Submission fails
**Checklist:**
1. Is student enrolled in the course?
2. Is task status = 'active'?
3. Is either submission_url or submission_text provided?

## Security Features

1. **Role-based access**: Admins can create/manage tasks, students can only view/submit
2. **Enrollment verification**: Students can only submit tasks for courses they're enrolled in
3. **Domain isolation**: Students only see tasks matching their domain
4. **Submission uniqueness**: One submission per student per task (can be updated)

## Performance Optimizations

1. **Indexes on critical columns**:
   - `tasks.domain`
   - `tasks.course_id`
   - `tasks.status`
   - `task_submissions.user_id`
   - `task_submissions.task_id`

2. **Efficient queries**:
   - Using enrolled_course_ids array for fast filtering
   - LEFT JOIN for submissions to avoid multiple queries
   - Proper use of SELECT with specific columns

## Next Steps

1. **File Uploads**: Add support for file attachments in submissions
2. **Notifications**: Notify students of new tasks and grading
3. **Deadline Reminders**: Send reminders before task deadlines
4. **Bulk Operations**: Allow admins to grade multiple submissions at once
5. **Analytics**: Show task completion rates and average scores

---

## Quick Reference

### Admin Tasks
- **Create**: `POST /api/admin/tasks`
- **View All**: `GET /api/admin/tasks?domain=X&status=active`
- **View Submissions**: `GET /api/admin/submissions`

### Student Tasks
- **View My Tasks**: `GET /api/student/tasks`
- **Submit Task**: `POST /api/student/submissions`
- **View My Submissions**: `GET /api/student/submissions`

### Database Helper
```sql
-- Get tasks for a specific student
SELECT * FROM get_student_tasks('student-uuid');
```
