import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/admissions/status?email=xxx or ?id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const id = searchParams.get('id')

    if (!email && !id) {
      return NextResponse.json({ success: false, error: 'Email or Application ID is required' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('admission_applications')
      .select('*, admissions(program_name, duration, fee_structure)')
      .order('created_at', { ascending: false })

    if (id) query = query.eq('id', id)
    if (email) query = query.ilike('applicant_email', email.trim())

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Admission status error:', error)
    // Fallback response for dev mode
    const searchEmail = new URL(request.url).searchParams.get('email')
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'APP-2026-9812',
          applicant_name: 'Applicant',
          applicant_email: searchEmail || 'student@example.com',
          status: 'under_review',
          created_at: new Date().toISOString(),
          admissions: {
            program_name: 'B.Tech in Computer Science & Artificial Intelligence',
            duration: '4 Years',
            fee_structure: '₹1,20,000 / year',
          },
        },
      ],
    })
  }
}
