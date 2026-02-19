# Profiles Table Migration - Complete

## Overview
Successfully migrated all application code from using the `users` table to using the `profiles` table exclusively. This resolves the confusion between the custom `users` table and Supabase's default `profiles` table.

## Changes Made

### 1. Core Libraries
- **src/lib/supabase.ts**
  - Updated `adminAPI.getStudents()` to query `profiles` table
  - Updated `adminAPI.getStudent()` to query `profiles` table
  - Updated `adminAPI.createStudent()` to insert into `profiles` table
  - Updated `adminAPI.updateStudent()` to update `profiles` table
  - Updated `getDashboardStats()` to count students from `profiles` table with role filter
  - Added field mapping: `status` filter maps to `account_status` in database

- **src/lib/auth.ts** (Previously updated)
  - Updated to query `profiles` table for authentication

### 2. API Routes - Student Management
- **src/app/api/admin/students/route.ts** (Previously updated)
  - Queries `profiles` table for student list
  - Maps `account_status` → `status` for frontend compatibility

- **src/app/api/admin/students/[id]/route.ts**
  - GET: Updated to fetch from `profiles` table with field mapping
  - PUT: Updated to update `profiles` table with reverse mapping (`status` → `account_status`)

- **src/app/api/admin/students/[id]/reset-password/route.ts**
  - Updated student verification to use `profiles` table

- **src/app/api/admin/students/create/route.ts** (Previously updated)
  - Already using `profiles` table for student creation

### 3. API Routes - Settings & User Management
- **src/app/api/admin/settings/route.ts**
  - GET: Fetches user settings from `profiles` table
  - PATCH: Updates user settings in `profiles` table
  - Removed `phone` field (stored in auth metadata instead)

- **src/app/api/admin/settings/avatar/upload/route.ts**
  - Updates `profile_image_url` in `profiles` table

- **src/app/api/admin/users/[id]/badges/route.ts**
  - Verifies user existence using `profiles` table

### 4. API Routes - Certificates & Projects
- **src/app/api/admin/certificates/issue/route.ts**
  - Verifies user existence using `profiles` table

- **src/app/api/admin/projects/route.ts**
  - Fetches user details from `profiles` table when enriching project data

### 5. API Routes - Reports & Analytics
- **src/app/api/admin/reports/overview/route.ts**
  - Queries `profiles` table for student statistics
  - Maps `account_status` → `status` for frontend compatibility
  - Removed fallback to `users` table

### 6. API Routes - Course Management
- **src/app/api/admin/courses/[id]/enrollments/route.ts**
  - Updated to use `enrollments` table with JOIN to `profiles`
  - Maps `account_status` → `status` in user object
  - No longer queries `users` table or uses `enrolled_course_ids` column

### 7. Frontend - Authentication & Layouts
- **src/app/login/page.tsx**
  - Removed `users` table fallback
  - Queries only `profiles` table for role determination

- **src/app/student/layout.tsx**
  - Removed `users` table fallback
  - Queries only `profiles` table for role verification

- **src/app/admin/layout.tsx**
  - Removed `users` table fallback
  - Queries only `profiles` table for role verification

### 8. Student Portal APIs (Previously updated)
- **src/app/api/student/courses/route.ts**
- **src/app/api/student/tasks/route.ts**
- **src/app/api/student/projects/route.ts**
- **src/app/api/student/videos/route.ts**
  - All already updated to use `profiles` table via `requireAuth`

## Field Mapping Pattern
Since the frontend expects `status` but the database has `account_status`, we implement bidirectional mapping:

### Database → Frontend (when reading)
```typescript
const studentData = {
  ...data,
  status: data.account_status || 'active'
}
```

### Frontend → Database (when writing)
```typescript
if (body.status) {
  updateData.account_status = body.status
}
```

## Excluded Files
- **src/app/api/admin/debug-db/route.ts**: Intentionally left unchanged as it's a debug route that checks both `users` and `profiles` tables for comparison purposes.

## Database Schema
The `profiles` table (Supabase Auth default) has these key columns:
- `id` (UUID, primary key, references auth.users)
- `email` (text)
- `full_name` (text)
- `role` (text, e.g., 'student', 'admin')
- `account_status` (text, e.g., 'active', 'inactive')
- `profile_image_url` (text, nullable)
- `created_at` (timestamp)

Note: `phone` is now stored in Supabase Auth's `user_metadata` rather than in the profiles table.

## Testing Recommendations
1. Test student creation flow end-to-end
2. Test student login (both admin and student roles)
3. Test student list/detail pages in admin portal
4. Test student portal course enrollment display
5. Test profile settings update in admin portal
6. Test certificate issuance
7. Test project submissions
8. Test reports/analytics pages

## Migration Benefits
- ✅ Eliminates confusion between `users` and `profiles` tables
- ✅ Aligns with Supabase Auth best practices
- ✅ Consistent data source across all application code
- ✅ Proper use of Supabase's built-in authentication system
- ✅ Reduced code complexity (no more fallback queries)

## Notes
- All API routes now exclusively use `profiles` table
- Field mapping layer handles `status`/`account_status` differences transparently
- Phone numbers stored in auth `user_metadata` instead of profiles table
- RLS policies should be reviewed to ensure they work with `profiles` table
- The custom `users` table can be safely dropped after verifying everything works

## Files Modified (Total: 16)
1. src/lib/supabase.ts
2. src/lib/auth.ts
3. src/app/api/admin/students/route.ts
4. src/app/api/admin/students/[id]/route.ts
5. src/app/api/admin/students/[id]/reset-password/route.ts
6. src/app/api/admin/students/create/route.ts
7. src/app/api/admin/settings/route.ts
8. src/app/api/admin/settings/avatar/upload/route.ts
9. src/app/api/admin/users/[id]/badges/route.ts
10. src/app/api/admin/certificates/issue/route.ts
11. src/app/api/admin/projects/route.ts
12. src/app/api/admin/reports/overview/route.ts
13. src/app/api/admin/courses/[id]/enrollments/route.ts
14. src/app/login/page.tsx
15. src/app/student/layout.tsx
16. src/app/admin/layout.tsx

---

**Migration completed successfully. No TypeScript errors. Ready for testing.**
