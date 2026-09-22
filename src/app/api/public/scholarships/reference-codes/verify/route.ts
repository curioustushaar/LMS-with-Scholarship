import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkCustomRateLimit, getClientIP } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// GET /api/public/scholarships/reference-codes/verify?code=REF-VIP-1001
export async function GET(request: Request) {
  try {
    const clientIp = getClientIP(request)
    const rateCheck = checkCustomRateLimit(`verify_ref_${clientIp}`, 30, 15 * 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Too many verification requests. Please try again in a few minutes.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const rawCode = searchParams.get('code')

    if (!rawCode || !rawCode.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Referral code parameter is required.' },
        { status: 400 }
      )
    }

    const cleanCode = rawCode.trim().toUpperCase()

    // Query scholarship_reference_codes
    const { data: refCode, error } = await supabaseAdmin
      .from('scholarship_reference_codes')
      .select('id, name, code, status, discount_percent')
      .eq('code', cleanCode)
      .maybeSingle()

    if (error) {
      console.warn('Notice verifying referral code:', error.message)
      // Fallback: If table doesn't exist yet, return helpful message
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: 'Referral code system undergoing database sync. Please try again shortly.',
        })
      }
      return NextResponse.json({ success: false, valid: false, error: 'Failed to verify referral code.' })
    }

    if (!refCode) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Referral code "${cleanCode}" was not found. Please check with your representative.`,
      })
    }

    if (refCode.status !== 'active') {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Referral code "${cleanCode}" is currently inactive.`,
      })
    }

    const discountPercent = Math.max(0, Math.min(100, Number(refCode.discount_percent) || 0))

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        code: refCode.code,
        representative_name: refCode.name,
        status: refCode.status,
        discount_percent: discountPercent,
      },
      message: discountPercent > 0
        ? `✓ Valid Referral Code (${refCode.name} - ${discountPercent}% Discount Applied)`
        : `✓ Valid Referral Code (Representative: ${refCode.name})`,
    })
  } catch (err: any) {
    console.error('Exception verifying referral code:', err)
    return NextResponse.json(
      { success: false, valid: false, error: 'Server error verifying referral code.' },
      { status: 500 }
    )
  }
}
