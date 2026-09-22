import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'
import { validateName, validatePhone, validateEmail } from '@/lib/scholarship-validation'

export const dynamic = 'force-dynamic'

// Helper to generate a clean, readable reference code
function generateReferenceCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() || 'VIP'
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `REF-${cleanName}-${randomSuffix}`
}

// Ensure table exists fallback mechanism
async function ensureReferenceCodesTable() {
  try {
    const { error } = await supabaseAdmin.from('scholarship_reference_codes').select('id').limit(1)
    if (error && error.code === '42P01') {
      // Table does not exist in Postgres, attempt to create it via RPC or SQL if available
      console.log('scholarship_reference_codes table not found, attempting auto-creation...')
      await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS scholarship_reference_codes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'active',
            discount_percent NUMERIC NOT NULL DEFAULT 0,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_scholarship_ref_code ON scholarship_reference_codes(code);
        `
      })
    }
  } catch (err) {
    // Ignore RPC missing error, supabase will handle regular queries
    console.warn('Notice while checking reference codes table:', err)
  }
}

// GET /api/superadmin/scholarships/reference-codes
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    await ensureReferenceCodesTable()

    // 1. Fetch all reference codes
    const { data: refCodes, error: refErr } = await supabaseAdmin
      .from('scholarship_reference_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (refErr) {
      console.warn('Error querying scholarship_reference_codes:', refErr.message)
      // If table doesn't exist yet, return empty list safely
      return NextResponse.json({
        success: true,
        data: [],
        stats: {
          total_codes: 0,
          active_codes: 0,
          inactive_codes: 0,
          total_referred_students: 0,
        }
      })
    }

    // 2. Fetch all scholarship applications to map referred candidates
    const { data: applicants, error: appErr } = await supabaseAdmin
      .from('scholarship_applications')
      .select('id, application_no, applicant_name, applicant_email, applicant_phone, scholarship_id, scholarship_title, created_at, status, payment_status, admit_card_status, reference_code, documents')
      .order('created_at', { ascending: false })

    if (appErr) {
      console.warn('Notice querying applications for referral mapping:', appErr.message)
    }

    // 3. Map students to reference codes
    const referredStudentsMap: Record<string, any[]> = {}
    let totalReferredStudentsCount = 0

    ;(applicants || []).forEach((app: any) => {
      const directCode = app.reference_code?.toString().trim().toUpperCase()
      const docCode = app.documents?.reference_code?.toString().trim().toUpperCase()
      const effectiveCode = directCode || docCode

      if (effectiveCode) {
        totalReferredStudentsCount++
        if (!referredStudentsMap[effectiveCode]) {
          referredStudentsMap[effectiveCode] = []
        }
        referredStudentsMap[effectiveCode].push({
          id: app.id,
          application_no: app.application_no,
          applicant_name: app.applicant_name,
          applicant_email: app.applicant_email,
          applicant_phone: app.applicant_phone,
          scholarship_title: app.scholarship_title,
          created_at: app.created_at,
          status: app.status,
          payment_status: app.payment_status,
          admit_card_status: app.admit_card_status,
        })
      }
    })

    // 4. Enrich reference codes with student metrics
    const enrichedCodes = (refCodes || []).map((rc: any) => {
      const codeKey = rc.code?.toString().trim().toUpperCase()
      const students = referredStudentsMap[codeKey] || []
      return {
        ...rc,
        discount_percent: Number(rc.discount_percent) || 0,
        students_count: students.length,
        referred_students: students,
      }
    })

    const activeCount = enrichedCodes.filter((c: any) => c.status === 'active').length
    const inactiveCount = enrichedCodes.filter((c: any) => c.status === 'inactive').length

    return NextResponse.json({
      success: true,
      data: enrichedCodes,
      stats: {
        total_codes: enrichedCodes.length,
        active_codes: activeCount,
        inactive_codes: inactiveCount,
        total_referred_students: totalReferredStudentsCount,
      }
    })
  } catch (error: any) {
    console.error('Superadmin reference-codes GET exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/scholarships/reference-codes
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, phone, email, code: customCode, notes, discount_percent } = body

    // 1. Production Validation
    const nameVal = validateName(name, 'Representative Name')
    if (!nameVal.isValid) {
      return NextResponse.json({ success: false, error: nameVal.message }, { status: 400 })
    }

    const phoneVal = validatePhone(phone)
    if (!phoneVal.isValid) {
      return NextResponse.json({ success: false, error: phoneVal.message }, { status: 400 })
    }

    const emailVal = validateEmail(email)
    if (!emailVal.isValid) {
      return NextResponse.json({ success: false, error: emailVal.message }, { status: 400 })
    }

    // Validate Discount Percentage (0 to 100)
    const parsedDiscount = Math.max(0, Math.min(100, Number(discount_percent) || 0))

    await ensureReferenceCodesTable()

    const formattedCode = customCode?.trim()
      ? customCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
      : generateReferenceCode(nameVal.cleanName)

    // Check if code already exists
    const { data: existing } = await supabaseAdmin
      .from('scholarship_reference_codes')
      .select('id, code')
      .eq('code', formattedCode)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Reference Code "${formattedCode}" already exists. Please choose a different code.` },
        { status: 409 }
      )
    }

    const newRefCode = {
      id: `ref-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: nameVal.cleanName,
      phone: phoneVal.cleanPhone,
      email: emailVal.cleanEmail,
      code: formattedCode,
      discount_percent: parsedDiscount,
      status: 'active',
      notes: notes?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('scholarship_reference_codes')
      .insert(newRefCode)
      .select()
      .single()

    if (insertErr) {
      console.error('Error inserting reference code:', insertErr)
      if (insertErr.code === 'PGRST205' || insertErr.message?.includes('schema cache')) {
        return NextResponse.json({
          success: false,
          error: 'Table scholarship_reference_codes does not exist in Supabase database yet. Please run the SQL file "migrations/20260222_add_discount_to_reference_codes.sql" in your Supabase SQL Editor.'
        }, { status: 500 })
      }
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Reference Code "${formattedCode}" generated successfully with ${parsedDiscount}% discount!`,
      data: {
        ...inserted,
        discount_percent: parsedDiscount,
        students_count: 0,
        referred_students: [],
      }
    })
  } catch (error: any) {
    console.error('Superadmin reference-codes POST exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/scholarships/reference-codes
export async function PUT(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, status, name, phone, email, notes, code: updatedCode, discount_percent } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Reference Code ID is required.' }, { status: 400 })
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (status !== undefined) {
      if (status !== 'active' && status !== 'inactive') {
        return NextResponse.json({ success: false, error: 'Status must be "active" or "inactive".' }, { status: 400 })
      }
      updatePayload.status = status
    }

    if (name?.trim()) updatePayload.name = name.trim()
    if (phone?.trim()) updatePayload.phone = phone.trim()
    if (email?.trim()) updatePayload.email = email.trim().toLowerCase()
    if (notes !== undefined) updatePayload.notes = notes.trim()
    if (updatedCode?.trim()) updatePayload.code = updatedCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
    if (discount_percent !== undefined) {
      updatePayload.discount_percent = Math.max(0, Math.min(100, Number(discount_percent) || 0))
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('scholarship_reference_codes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      console.error('Error updating reference code:', updateErr)
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Reference Code updated successfully!`,
      data: updated
    })
  } catch (error: any) {
    console.error('Superadmin reference-codes PUT exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/scholarships/reference-codes
export async function DELETE(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch (_) {
        // No json body
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Reference Code ID is required for deletion.' }, { status: 400 })
    }

    const { error: delErr } = await supabaseAdmin
      .from('scholarship_reference_codes')
      .delete()
      .eq('id', id)

    if (delErr) {
      console.error('Error deleting reference code:', delErr)
      return NextResponse.json({ success: false, error: delErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Reference code deleted successfully.'
    })
  } catch (error: any) {
    console.error('Superadmin reference-codes DELETE exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
