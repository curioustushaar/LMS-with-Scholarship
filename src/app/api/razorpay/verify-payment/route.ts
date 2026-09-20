import { NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

function getRazorpaySecret() {
  let key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_secret) {
    try {
      const envPath = path.join(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        const lines = envContent.split('\n')
        for (const line of lines) {
          const match = line.match(/^\s*RAZORPAY_KEY_SECRET\s*=\s*(.*?)\s*$/)
          if (match && match[1]?.trim()) {
            key_secret = match[1].trim()
            break
          }
        }
      }
    } catch (e) {
      console.error('Failed to read .env fallback in verify-payment:', e)
    }
  }

  return key_secret
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required Razorpay verification parameters' },
        { status: 400 }
      )
    }

    const key_secret = getRazorpaySecret()

    if (!key_secret) {
      return NextResponse.json(
        { success: false, error: 'RAZORPAY_KEY_SECRET is not configured in .env' },
        { status: 500 }
      )
    }

    // Verify signature: SHA256(order_id + "|" + payment_id, secret)
    const signBody = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(signBody)
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({
        success: true,
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: 'Razorpay payment signature mismatch / verification failed.',
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Razorpay verification exception:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}
