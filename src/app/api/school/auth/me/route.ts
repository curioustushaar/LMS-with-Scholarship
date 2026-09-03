import { NextResponse } from 'next/server'
import { verifySchoolAccess, schoolErrorResponse, schoolSuccessResponse } from '@/lib/school-auth'

// GET /api/school/auth/me
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  return NextResponse.json({
    success: true,
    school: auth.school,
    user: {
      id: auth.userId,
      email: auth.email,
      role: 'school',
    },
  })
}
