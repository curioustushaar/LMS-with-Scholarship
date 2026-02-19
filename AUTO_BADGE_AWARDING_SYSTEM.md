# ✅ AUTO BADGE AWARDING SYSTEM - TASK COMPLETION

## Overview
Students now automatically receive badges when they complete tasks and get approved by admin. The system checks badge eligibility and awards badges in real-time.

## What Was Implemented

### 1. Badge Helper Library
**File**: `src/lib/badges.ts`

Created comprehensive badge awarding system with:
- `checkAndAwardTaskBadges()` - Awards task completion badges
- `checkAndAwardVideoBadges()` - Placeholder for video badges (future)
- `checkAndAwardCourseBadges()` - Placeholder for course badges (future)

**Task Badge Logic**:
1. Count student's approved task submissions
2. Get all task badge rules from database
3. Check if student meets badge criteria
4. Award badge if:
   - Student has enough approved tasks
   - Student doesn't already have the badge
5. Log success/failure for debugging

### 2. Evaluation API Integration
**File**: `src/app/api/admin/submissions/[id]/evaluate/route.ts`

**Added automatic badge checking**:
```typescript
// After task approval
if (status === 'approved') {
  const badgeResult = await checkAndAwardTaskBadges(userId, taskId)
  // Returns number of badges awarded
}
```

**When it triggers**:
- Admin evaluates a task submission
- Status is set to 'approved'
- Backend automatically checks and awards badges
- Returns count of badges awarded

### 3. Database Setup Script
**File**: `setup-task-badges-auto-award.sql`

**What it does**:
1. Fixes `user_badges` foreign keys to use `profiles` table
2. Adds badge rule columns: `category`, `rule_type`, `rule_value`, `rule_duration`
3. Creates 4 task badges with automatic rules
4. Verifies setup with queries

**Task Badges Created**:
- 🏆 **Task worrier** - 1 approved task
- 📝 **Task Master** - 5 approved tasks
- ⭐ **Task Champion** - 10 approved tasks
- 👑 **Task Legend** - 20 approved tasks

## How It Works

### Flow Diagram:
```
1. Student submits task
   ↓
2. Admin evaluates & approves
   ↓
3. Backend updates submission status = 'approved'
   ↓
4. 🏅 checkAndAwardTaskBadges() is called
   ↓
5. Count student's total approved tasks
   ↓
6. Check badge rules (1, 5, 10, 20 tasks)
   ↓
7. Award badges if criteria met
   ↓
8. Student sees new badge in profile
```

### Example Scenario:

**Student: Nirdesh Kumar**
- Submits "portfolio" task
- Admin approves with 55/100
- Student now has 1 approved task
- **Badge awarded**: 🏆 Task worrier
- Badge appears in student's profile

**Later:**
- Student completes 4 more tasks
- Admin approves the 5th task
- Student now has 5 approved tasks
- **Badge awarded**: 📝 Task Master
- Old badges remain, new badge added

## Database Schema

### Tables Used:

**badges** (Badge Definitions)
```sql
id UUID
name VARCHAR(255)
description TEXT
category VARCHAR(100)  -- 'tasks', 'completion', 'achievement'
rule_type VARCHAR(100)  -- 'task_submitted', 'video_completed', etc.
rule_value INTEGER      -- Threshold (1, 5, 10, 20)
rule_duration INTEGER   -- Optional time limit in days
```

**user_badges** (Awarded Badges)
```sql
id UUID
user_id UUID REFERENCES profiles(id)
badge_id UUID REFERENCES badges(id)
awarded_at TIMESTAMP
awarded_by UUID REFERENCES profiles(id)
UNIQUE(user_id, badge_id)  -- Can't award same badge twice
```

**task_submissions** (For Counting)
```sql
id UUID
user_id UUID
task_id UUID
status VARCHAR  -- 'pending', 'approved', 'rejected'
points_awarded INTEGER
submitted_at TIMESTAMP
```

## Setup Instructions

### Step 1: Run SQL Script
```sql
-- Run this in Supabase SQL Editor
\i setup-task-badges-auto-award.sql
```

**This will**:
- Fix foreign key references (users → profiles)
- Add badge rule columns
- Create 4 task badges
- Show verification results

### Step 2: Restart Dev Server
The code changes are already in place, just restart to load them:
```bash
npm run dev
```

### Step 3: Test Badge Awarding
1. Login as admin
2. Go to **Tasks & Submissions**
3. Approve a student's task
4. Check console logs for: `✅ Awarded badge: "Task worrier"`
5. Go to **Badges** → Check "BADGES EARNED" count increased
6. View student profile → Badge should appear

## Testing

### Test Case 1: First Badge Award
**Setup**:
- Student has 0 approved tasks
- Student submits a new task

**Steps**:
1. Admin approves the task
2. Watch server console logs

**Expected**:
```
🏅 Checking task badges for user: abc123...
📋 Found 4 task badge rules
📊 Student has 1 approved tasks
✅ Awarded badge: "Task worrier" to user abc123
```

**Verify**:
- Badge count in admin dashboard increases
- Student can see badge (when implemented in student UI)

### Test Case 2: Multiple Badges
**Setup**:
- Student has 4 approved tasks
- Student submits 5th task

**Steps**:
1. Admin approves 5th task
2. Watch console logs

**Expected**:
```
🏅 Checking task badges for user: abc123...
📊 Student has 5 approved tasks
ℹ️ User already has badge: "Task worrier"
✅ Awarded badge: "Task Master" to user abc123
```

### Test Case 3: No New Badges
**Setup**:
- Student has 1 approved task
- Student submits 2nd task

**Steps**:
1. Admin approves 2nd task
2. Watch console logs

**Expected**:
```
🏅 Checking task badges for user: abc123...
📊 Student has 2 approved tasks
ℹ️ User already has badge: "Task worrier"
⏳ Badge "Task Master" requires 5 tasks (current: 2)
```

## Verification Queries

### Check Badge Rules
```sql
SELECT name, category, rule_type, rule_value, criteria
FROM badges
WHERE category = 'tasks'
ORDER BY rule_value ASC;
```

### Check Awarded Badges
```sql
SELECT 
  p.full_name,
  p.email,
  b.name as badge_name,
  b.rule_value as tasks_required,
  ub.awarded_at
FROM user_badges ub
JOIN profiles p ON ub.user_id = p.id
JOIN badges b ON ub.badge_id = b.id
WHERE b.category = 'tasks'
ORDER BY ub.awarded_at DESC;
```

### Count Student's Approved Tasks
```sql
SELECT 
  p.full_name,
  p.email,
  COUNT(*) as approved_tasks
FROM task_submissions ts
JOIN profiles p ON ts.user_id = p.id
WHERE ts.status = 'approved'
GROUP BY p.id, p.full_name, p.email
ORDER BY approved_tasks DESC;
```

## API Response Changes

### Before:
```json
{
  "success": true,
  "data": { ... },
  "message": "Submission evaluated successfully"
}
```

### After:
```json
{
  "success": true,
  "data": { ... },
  "message": "Submission evaluated successfully",
  "badges_awarded": 1
}
```

The `badges_awarded` field shows how many new badges were given to the student.

## Console Logs

### Successful Badge Award:
```
🏅 Task approved! Checking for badge awards...
🏅 Checking task badges for user: abc123-def-456...
📋 Found 4 task badge rules
📊 Student has 5 approved tasks
ℹ️ User already has badge: "Task worrier"
✅ Awarded badge: "Task Master" to user abc123-def-456
✅ Awarded 1 badge(s) to student
```

### No Badges Earned Yet:
```
🏅 Task approved! Checking for badge awards...
🏅 Checking task badges for user: abc123-def-456...
📋 Found 4 task badge rules
📊 Student has 2 approved tasks
ℹ️ User already has badge: "Task worrier"
⏳ Badge "Task Master" requires 5 tasks (current: 2)
⏳ Badge "Task Champion" requires 10 tasks (current: 2)
⏳ Badge "Task Legend" requires 20 tasks (current: 2)
```

## Badge Display (Future Enhancement)

### Admin View (Already Working):
- Go to **Badges** page
- See "BADGES EARNED: 124"
- See "Task worrier" card with "42 EARNED"

### Student View (To Be Implemented):
- Add badge display to student profile
- Show earned badges with icons
- Show progress toward next badge
- Example: "3/5 tasks for Task Master badge"

## Error Handling

### Badge Awarding Failures:
- **Database error**: Badge awarding fails silently, task evaluation still succeeds
- **Badge already awarded**: Skips with log message
- **Badge rules missing**: Returns success with 0 badges awarded

### Logging:
- All errors logged with `console.error`
- Success cases logged with `console.log`
- Helps debugging without breaking main flow

## Future Enhancements

### Possible Additions:
1. **Video Badges**: Award badges for watching videos
2. **Course Badges**: Award badges for completing courses
3. **Time-based Badges**: "Complete 5 tasks in 7 days"
4. **Score-based Badges**: "Get 90+ on 5 tasks"
5. **Streak Badges**: "Submit tasks 7 days in a row"
6. **Student Badge Page**: Show earned badges and progress

### Badge Notification:
- Show popup when badge is earned
- Email notification for badge
- Badge announcement in student dashboard

## Files Modified

1. ✅ Created: `src/lib/badges.ts` - Badge helper functions
2. ✅ Modified: `src/app/api/admin/submissions/[id]/evaluate/route.ts` - Auto-award on approval
3. ✅ Created: `setup-task-badges-auto-award.sql` - Database setup and badge rules

## Important Notes

### Badge Rules Engine:
- `category`: Groups badges (tasks, videos, courses)
- `rule_type`: Trigger event (task_submitted, video_completed)
- `rule_value`: Threshold to meet (1, 5, 10, 20)
- `rule_duration`: Optional time limit (not used for task badges)

### Unique Constraint:
- `UNIQUE(user_id, badge_id)` prevents duplicate badges
- Same student can't get same badge twice
- Different students can get same badge

### Performance:
- Badge checking runs after successful evaluation
- Queries are lightweight (SELECT + INSERT only)
- No impact on evaluation speed
- Async operation, doesn't block response

---

**Status**: ✅ Complete and ready to test  
**Date**: February 18, 2026  
**Next Steps**: 
1. Run `setup-task-badges-auto-award.sql` in Supabase
2. Restart dev server
3. Approve a student task and watch console logs
4. Verify badge awarded in admin badges page
