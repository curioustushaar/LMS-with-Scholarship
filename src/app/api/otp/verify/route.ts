import { NextResponse } from 'next/server'
import { verifyMSG91OTP } from '@/lib/msg91'
import { getClientIP, checkCustomRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// POST /api/otp/verify
export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const rateCheck = checkCustomRateLimit(`otp_verify_${ip}`, 10, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many verification attempts. Please wait ${Math.ceil(rateCheck.resetSeconds / 60)} minutes.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { mobile, otp, req_id, reqId } = body

    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and OTP are required.' },
        { status: 400 }
      )
    }

    const result = await verifyMSG91OTP(mobile, otp, req_id || reqId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully.',
        verification_token: `VERIFIED_${Date.now()}_${mobile.slice(-4)}`,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.message || 'Invalid OTP code. Please try again.' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('OTP Verify error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
