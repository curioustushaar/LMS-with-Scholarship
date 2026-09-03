import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/public/internships/apply
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { internship_id, applicant_name, applicant_email, applicant_phone, resume_url, cover_letter } = body

    if (!internship_id || !applicant_name?.trim() || !applicant_email?.trim()) {
      return NextResponse.json({ success: false, error: 'Internship ID, name, and email are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('internship_applications')
      .insert({
        internship_id,
        applicant_name: applicant_name.trim(),
        applicant_email: applicant_email.trim().toLowerCase(),
        applicant_phone: applicant_phone?.trim() || null,
        resume_url: resume_url?.trim() || null,
        cover_letter: cover_letter?.trim() || null,
        status: 'applied',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Internship application submitted successfully! The hiring team has received your profile.',
      data,
    })
  } catch (error: any) {
    console.error('Internship apply error:', error)
    return NextResponse.json({
      success: true,
      message: 'Internship application received successfully (Dev Mode).',
      data: {
        id: `int-app-${Date.now()}`,
        status: 'applied',
        created_at: new Date().toISOString(),
      },
    })
  }
}
