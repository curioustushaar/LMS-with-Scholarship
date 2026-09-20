import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import fs from 'fs'
import path from 'path'

function getRazorpayCredentials() {
  let key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  let key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    try {
      const envPath = path.join(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        const lines = envContent.split('\n')
        for (const line of lines) {
          const match = line.match(/^\s*(NEXT_PUBLIC_RAZORPAY_KEY_ID|RAZORPAY_KEY_ID|RAZORPAY_KEY_SECRET)\s*=\s*(.*?)\s*$/)
          if (match) {
            const [, key, val] = match
            const cleanVal = val.trim()
            if (cleanVal) {
              if ((key === 'RAZORPAY_KEY_ID' || key === 'NEXT_PUBLIC_RAZORPAY_KEY_ID') && !key_id) {
                key_id = cleanVal
              }
              if (key === 'RAZORPAY_KEY_SECRET' && !key_secret) {
                key_secret = cleanVal
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to read .env fallback:', e)
    }
  }

  return { key_id, key_secret }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, scholarship_id, applicant_name, applicant_email, applicant_phone } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid payment amount' }, { status: 400 })
    }

    const { key_id, key_secret } = getRazorpayCredentials()

    if (!key_id || !key_secret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay keys are missing in system environment variables (.env). Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
          requires_config: true,
        },
        { status: 400 }
      )
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    })

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise (INR)
      currency: 'INR',
      receipt: `sch_rec_${Date.now().toString().slice(-10)}`,
      notes: {
        scholarship_id: scholarship_id || '',
        applicant_name: applicant_name || '',
        applicant_email: applicant_email || '',
        applicant_phone: applicant_phone || '',
      },
    }

    const order = await instance.orders.create(options)

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id,
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Razorpay payment order.',
      },
      { status: 500 }
    )
  }
}
