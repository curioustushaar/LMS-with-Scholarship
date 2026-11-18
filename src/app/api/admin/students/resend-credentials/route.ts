import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { sendStudentCredentialsEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/students/resend-credentials
 * Send or resend login credentials email to student
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { email, password, student_id, student_name, student_class, school_coaching, phone } = body

    if (!email || !student_name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, student name and password are required' },
        { status: 400 }
      )
    }

    console.log('📧 Admin manually triggering credentials email for:', email)

    const result = await sendStudentCredentialsEmail({
      to: email,
      student_id,
      student_name,
      email,
      password,
      phone,
      student_class,
      school_coaching
    })

    if (!result.success) {
      console.warn('⚠️ Manual credentials email send failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send email via SMTP service'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Login credentials email sent successfully to ${email}`
    })

  } catch (err: any) {
    console.error('💥 Error in resend-credentials route:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal server error'
    }, { status: 500 })
  }
}
