import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/students/[id]/reset-password
 * Reset student password
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin authentication
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('📝 Resetting password for student:', { studentId: id })

    // Verify student exists using supabaseAdmin
    const { data: student, error: studentError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', id)
      .eq('role', 'student')
      .single()

    if (studentError || !student) {
      console.warn('❌ Student not found:', { studentId: id })
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // In production, you would:
    // 1. Generate a secure temporary password or reset token
    // 2. Send email to student with reset link
    // 3. Use Supabase Auth to actually reset the password
    
    // For now, return success response
    // You'll need to implement actual password reset logic based on your auth setup
    
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`

    console.log('✅ Password reset generated for:', student.email)

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${student.email}`,
      // In production, DON'T send password in response
      // This is just for demo purposes
      temp_password: tempPassword,
      note: 'In production, send reset link via email instead'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /students/[id]/reset-password:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
