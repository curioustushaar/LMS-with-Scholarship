import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'
import { packCenterTimingToLandmark, parseCenterTimingFromLandmark } from '@/lib/exam-center-timings'

export const dynamic = 'force-dynamic'

// GET /api/superadmin/scholarships/centers
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const district = searchParams.get('district')
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('exam_centers')
      .select('*')
      .order('state', { ascending: true })
      .order('district', { ascending: true })

    if (state && state !== 'all') {
      query = query.eq('state', state)
    }
    if (district && district !== 'all') {
      query = query.eq('district', district)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: centers, error } = await query
    if (error) {
      console.error('Error fetching exam centers:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Get live allocated count per center from applications
    const { data: apps } = await supabaseAdmin
      .from('scholarship_applications')
      .select('assigned_center_id')

    const centerCounts: Record<string, number> = {}
    if (apps) {
      apps.forEach((a: any) => {
        if (a.assigned_center_id) {
          centerCounts[a.assigned_center_id] = (centerCounts[a.assigned_center_id] || 0) + 1
        }
      })
    }

    const enrichedCenters = (centers || []).map((c: any) => {
      const timing = parseCenterTimingFromLandmark(c.landmark)
      return {
        ...c,
        landmark: timing.clean_landmark,
        reporting_time: timing.reporting_time,
        exam_start_time: timing.exam_start_time,
        exam_end_time: timing.exam_end_time,
        exam_shift: timing.exam_shift,
        allocated_count: centerCounts[c.id] || c.allocated_count || 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: enrichedCenters,
      total_centers: enrichedCenters.length,
      total_capacity: enrichedCenters.reduce((sum: number, c: any) => sum + (c.max_capacity || 0), 0),
      total_allocated: Object.values(centerCounts).reduce((a, b) => a + b, 0),
    })
  } catch (error: any) {
    console.error('Exam centers GET exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/scholarships/centers
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      center_code,
      center_name,
      state,
      district,
      city,
      address,
      pincode,
      landmark,
      google_maps_url,
      max_capacity,
      contact_person,
      contact_phone,
      contact_email,
      is_partner_school,
      school_id,
      status,
      reporting_time,
      exam_start_time,
      exam_end_time,
      exam_shift,
    } = body

    if (!center_name?.trim() || !state?.trim() || !district?.trim() || !address?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Center Name, State, District, and Address are required.' },
        { status: 400 }
      )
    }

    const generatedCode = center_code?.trim() || `${state.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
    const centerId = `ec-${Date.now()}`

    const packedLandmark = packCenterTimingToLandmark(
      landmark,
      reporting_time,
      exam_start_time,
      exam_end_time,
      exam_shift
    )

    const newCenter: Record<string, any> = {
      id: centerId,
      center_code: generatedCode,
      center_name: center_name.trim(),
      state: state.trim(),
      district: district.trim(),
      city: city?.trim() || district.trim(),
      address: address.trim(),
      pincode: pincode?.trim() || '',
      landmark: packedLandmark,
      google_maps_url: google_maps_url?.trim() || '',
      max_capacity: Number(max_capacity) || 150,
      allocated_count: 0,
      contact_person: contact_person?.trim() || '',
      contact_phone: contact_phone?.trim() || '',
      is_partner_school: !!is_partner_school,
      school_id: school_id || null,
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('exam_centers')
      .insert(newCenter)
      .select()
      .single()

    if (error) {
      console.error('Error creating exam center:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const timing = parseCenterTimingFromLandmark(data.landmark)
    const returnedData = {
      ...data,
      landmark: timing.clean_landmark,
      reporting_time: timing.reporting_time,
      exam_start_time: timing.exam_start_time,
      exam_end_time: timing.exam_end_time,
      exam_shift: timing.exam_shift,
    }

    return NextResponse.json({ success: true, message: 'Exam Center created successfully', data: returnedData })
  } catch (error: any) {
    console.error('Exam center POST exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/scholarships/centers
export async function PUT(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      id,
      reporting_time,
      exam_start_time,
      exam_end_time,
      exam_shift,
      landmark,
      ...updates
    } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Center ID is required.' }, { status: 400 })
    }

    const sanitizedUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    const allowedFields = [
      'center_code',
      'center_name',
      'state',
      'district',
      'city',
      'address',
      'pincode',
      'google_maps_url',
      'max_capacity',
      'allocated_count',
      'contact_person',
      'contact_phone',
      'is_partner_school',
      'school_id',
      'status',
    ]

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field]
      }
    })

    if (
      landmark !== undefined ||
      reporting_time !== undefined ||
      exam_start_time !== undefined ||
      exam_end_time !== undefined ||
      exam_shift !== undefined
    ) {
      sanitizedUpdates.landmark = packCenterTimingToLandmark(
        landmark,
        reporting_time,
        exam_start_time,
        exam_end_time,
        exam_shift
      )
    }

    const { data, error } = await supabaseAdmin
      .from('exam_centers')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating exam center:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const timing = parseCenterTimingFromLandmark(data.landmark)
    const returnedData = {
      ...data,
      landmark: timing.clean_landmark,
      reporting_time: timing.reporting_time,
      exam_start_time: timing.exam_start_time,
      exam_end_time: timing.exam_end_time,
      exam_shift: timing.exam_shift,
    }

    return NextResponse.json({ success: true, message: 'Exam Center updated successfully', data: returnedData })
  } catch (error: any) {
    console.error('Exam center PUT exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/scholarships/centers
export async function DELETE(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Center ID is required.' }, { status: 400 })
    }

    // Check if students are allocated
    const { count } = await supabaseAdmin
      .from('scholarship_applications')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_center_id', id)

    if (count && count > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete center: ${count} student(s) are currently assigned to this center. Please re-allocate them before deleting.`,
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('exam_centers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting exam center:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Exam Center deleted successfully' })
  } catch (error: any) {
    console.error('Exam center DELETE exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
