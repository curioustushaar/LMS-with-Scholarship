import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

// GET /api/school/profile
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  return NextResponse.json({
    success: true,
    data: auth.school,
  })
}

// PUT /api/school/profile (Update KYC / Bank Payout Details)
export async function PUT(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id
    const body = await request.json()
    const { beneficiary_name, account_number, ifsc_code, bank_name, document_url } = body

    if (!beneficiary_name?.trim() || !account_number?.trim() || !ifsc_code?.trim() || !bank_name?.trim()) {
      return schoolErrorResponse('Beneficiary Name, Bank Account Number, IFSC Code, and Bank Name are required.', 400)
    }

    const updatedBankDetails = {
      beneficiary_name: beneficiary_name.trim(),
      account_number: account_number.trim(),
      ifsc_code: ifsc_code.trim().toUpperCase(),
      bank_name: bank_name.trim(),
      document_url: document_url || '',
      is_verified: true,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedSchool, error } = await supabaseAdmin
      .from('schools')
      .update({
        bank_details: updatedBankDetails,
        updated_at: new Date().toISOString(),
      })
      .eq('school_id', schoolId)
      .select()
      .maybeSingle()

    if (error) {
      console.warn('Update school bank details error:', error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Bank payout & KYC details saved successfully!',
      data: updatedSchool || { ...auth.school, bank_details: updatedBankDetails },
    })
  } catch (error: any) {
    console.error('School profile PUT exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
