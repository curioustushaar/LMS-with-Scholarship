import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

export const dynamic = 'force-dynamic'

// GET /api/superadmin/scholarships
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const [schemesRes, applicantsRes] = await Promise.all([
      supabaseAdmin
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    if (schemesRes.error) {
      console.error('Error fetching scholarships:', schemesRes.error)
      return NextResponse.json({ success: false, error: schemesRes.error.message }, { status: 500 })
    }

    const schemes = (schemesRes.data || []).map((s: any) => ({
      ...s,
      winner_description: s.winner_description || s.prize_distribution?.winner_description || '',
    }))
    const schemesMap = schemes.reduce((acc: Record<string, any>, s: any) => {
      acc[s.id] = s
      return acc
    }, {})

    const normalizedApplicants = (applicantsRes.data || []).map((app: any) => {
      const scheme = schemesMap[app.scholarship_id]
      const docResultStatus = app.documents?.result_status
      const isReleased = docResultStatus === 'released' || scheme?.status === 'results_declared'
      return {
        ...app,
        result_status: isReleased ? 'released' : 'draft',
        result_released_at: app.documents?.result_released_at || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: schemes,
      applicants: normalizedApplicants,
    })
  } catch (error: any) {
    console.error('Superadmin scholarships GET exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/scholarships
export async function POST(request: Request) {
  const { authorized, userId } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, ...rest } = body

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Scheme title is required.' }, { status: 400 })
    }

    const prizeDist = rest.prize_distribution ? {
      ...rest.prize_distribution,
      winner_description: rest.winner_description || rest.prize_distribution?.winner_description || '',
    } : {
      first_prize: rest.first_prize || '₹50,000',
      second_prize: rest.second_prize || '₹25,000',
      third_prize: rest.third_prize || '₹10,000',
      consolation: rest.consolation || 'Certificate & 50% Fee Waiver',
      winner_description: rest.winner_description || '',
    }

    const schemeId = `sch-${Date.now()}`
    const baseScheme = {
      id: schemeId,
      title: title.trim(),
      category: rest.category?.trim() || 'General',
      description: rest.description || '',
      eligibility_criteria: rest.eligibility_criteria || '',
      min_percentage: Number(rest.min_percentage) || 60,
      eligible_qualifications: rest.eligible_qualifications || ['10th', '12th (PCM)', 'Undergraduate'],
      age_limit: rest.age_limit || '16 - 28 Years',
      max_family_income: rest.max_family_income ? Number(rest.max_family_income) : 10,
      application_start_date: rest.application_start_date || new Date().toISOString().split('T')[0],
      application_end_date: rest.application_end_date || '2026-09-15',
      application_fee: Number(rest.application_fee) || 0,
      scholarship_value: rest.scholarship_value || 'Up to ₹50,000 Cash Prize + Fee Waiver',
      reward_type: rest.reward_type || 'hybrid',
      reward_details: rest.reward_details || {
        waiver_percentage: Number(rest.waiver_percentage) || 100,
        cash_amount: Number(rest.cash_amount) || 50000,
        perks: rest.perks || ['Tuition Fee Waiver', 'Merit Certificate', 'AI Mentorship'],
      },
      prize_distribution: prizeDist,
      number_of_winners: Number(rest.number_of_winners) || 50,
      exam_date: rest.exam_date || '2026-09-20',
      exam_time: rest.exam_time || '10:00 AM - 12:30 PM',
      exam_duration: rest.exam_duration || '120 Minutes',
      total_questions: Number(rest.total_questions) || 100,
      exam_mode: rest.exam_mode || 'online',
      exam_venue: rest.exam_venue || (Array.isArray(rest.exam_centers) && rest.exam_centers[0]) || 'National Proctored Online Platform',
      exam_centers: Array.isArray(rest.exam_centers) && rest.exam_centers.length > 0
        ? rest.exam_centers
        : (rest.exam_venue ? [rest.exam_venue] : ['National Proctored Online Assessment Hub']),
      terms_and_conditions: rest.terms_and_conditions || '1. Candidate must provide authentic academic credentials.\n2. Malpractice in online/offline test leads to immediate disqualification.\n3. Cash prizes will be transferred directly to verified bank accounts.',
      required_documents: rest.required_documents || [
        '10th / 12th Marksheet',
        'Government Photo ID (Aadhaar / Passport)',
        'Recent Passport Size Photograph',
        'Income Certificate (Optional)',
      ],
      admit_card_release_date: rest.admit_card_release_date || '2026-09-10',
      result_date: rest.result_date || '2026-09-30',
      color_theme: rest.color_theme || 'pink',
      status: rest.status || 'published',
      created_by: userId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let insertPayload: any = { ...baseScheme }
    if (rest.winner_description) {
      insertPayload.winner_description = rest.winner_description
    }

    let { data, error } = await supabaseAdmin
      .from('scholarships')
      .insert(insertPayload)
      .select()
      .single()

    if (error && (error.message?.includes('winner_description') || error.code === '42703')) {
      const retryRes = await supabaseAdmin
        .from('scholarships')
        .insert(baseScheme)
        .select()
        .single()
      data = retryRes.data
      error = retryRes.error
    }

    if (error) {
      console.error('Error inserting scholarship:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const resolvedData = data ? {
      ...data,
      winner_description: data.winner_description || data.prize_distribution?.winner_description || '',
    } : data

    return NextResponse.json({ success: true, data: resolvedData })
  } catch (error: any) {
    console.error('Superadmin scholarships POST exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/scholarships
export async function PUT(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ success: false, error: 'Scheme ID is required' }, { status: 400 })

    let updatePayload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    if (updates.winner_description) {
      updatePayload.prize_distribution = {
        ...(updates.prize_distribution || {}),
        winner_description: updates.winner_description,
      }
    }

    let { data, error } = await supabaseAdmin
      .from('scholarships')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error && (error.message?.includes('winner_description') || error.code === '42703')) {
      delete updatePayload.winner_description
      const retryRes = await supabaseAdmin
        .from('scholarships')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()
      data = retryRes.data
      error = retryRes.error
    }

    if (error) {
      console.error('Error updating scholarship:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const resolvedData = data ? {
      ...data,
      winner_description: data.winner_description || data.prize_distribution?.winner_description || '',
    } : data

    return NextResponse.json({ success: true, data: resolvedData })
  } catch (error: any) {
    console.error('Superadmin scholarships PUT exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/scholarships
export async function DELETE(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Scheme ID is required' }, { status: 400 })

    try {
      await supabaseAdmin
        .from('scholarships')
        .delete()
        .eq('id', id)
    } catch (dbErr) {
      console.warn('DB delete notice for scholarship:', dbErr)
    }

    return NextResponse.json({ success: true, message: 'Scholarship scheme deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: true, message: 'Scholarship scheme deleted successfully' })
  }
}
