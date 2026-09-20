import { NextResponse } from 'next/server'
import { sendMSG91OTP } from '@/lib/msg91'
import { supabaseAdmin } from '@/lib/supabase'
import { getClientIP, checkCustomRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// POST /api/otp/send
export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const rateCheck = checkCustomRateLimit(`otp_send_${ip}`, 5, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many OTP requests. Please wait ${Math.ceil(rateCheck.resetSeconds / 60)} minutes.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { mobile, application_no } = body

    let targetMobile = mobile

    // If application_no provided, look up phone from database
    if (application_no && !targetMobile) {
      const { data: candidate } = await supabaseAdmin
        .from('scholarship_applications')
        .select('applicant_phone')
        .eq('application_no', application_no.trim())
        .maybeSingle()

      if (candidate?.applicant_phone) {
        targetMobile = candidate.applicant_phone
      }
    }

    if (!targetMobile) {
      return NextResponse.json(
        { success: false, error: 'Phone number or valid Application Number is required.' },
        { status: 400 }
      )
    }

    const result = await sendMSG91OTP(targetMobile)

    // Mask mobile for display (e.g. +91 98*****210)
    const cleaned = targetMobile.replace(/\D/g, '')
    const maskedMobile = cleaned.length >= 10
      ? `+91 ${cleaned.slice(0, 2)}*****${cleaned.slice(-3)}`
      : targetMobile

    return NextResponse.json({
      success: result.success,
      message: result.message,
      masked_phone: maskedMobile,
      req_id: result.reqId,
    })
  } catch (error: any) {
    console.error('OTP Send error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
