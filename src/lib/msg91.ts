/**
 * MSG91 OTP Helper Library
 * Uses official MSG91 OTP Widget v5 API
 */

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || ''
const MSG91_WIDGET_ID = process.env.MSG91_WIDGET_ID || ''

// Server-side store for mapping mobile numbers to MSG91 Widget reqId
const widgetReqIdStore = new Map<string, { reqId: string; expiresAt: number }>()

function formatMobileNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned
  }
  return cleaned
}

/**
 * Send OTP via MSG91 OTP Widget v5 API
 */
export async function sendMSG91OTP(phone: string): Promise<{ success: boolean; message: string; reqId?: string }> {
  const formattedMobile = formatMobileNumber(phone)

  if (!MSG91_AUTH_KEY || !MSG91_WIDGET_ID) {
    console.error('❌ MSG91_AUTH_KEY or MSG91_WIDGET_ID is missing in environment configuration.')
    return {
      success: false,
      message: 'MSG91 service configuration is missing.',
    }
  }

  try {
    console.log(`📱 [MSG91 Widget] Sending OTP to ${formattedMobile} using Widget ID ${MSG91_WIDGET_ID}...`)

    const response = await fetch('https://control.msg91.com/api/v5/widget/sendOtp', {
      method: 'POST',
      headers: {
        'authkey': MSG91_AUTH_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetId: MSG91_WIDGET_ID,
        identifier: formattedMobile,
      }),
    })

    const data = await response.json().catch(() => ({}))
    console.log('📱 [MSG91 Widget Send API Response]:', data)

    // MSG91 returns reqId in data.message (e.g., { type: 'success', message: '366974...' }) or data.reqId
    const reqId = typeof data.message === 'string' && data.message.length > 10
      ? data.message
      : data.reqId || data.request_id || data.data?.reqId

    if (data.type === 'success' || reqId) {
      if (reqId) {
        widgetReqIdStore.set(formattedMobile, {
          reqId: reqId,
          expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        })
      }

      return {
        success: true,
        message: 'OTP sent successfully to your registered mobile number.',
        reqId: reqId,
      }
    } else {
      console.warn('⚠️ MSG91 Widget Send API returned non-success:', data)
      return {
        success: false,
        message: data.message || 'Failed to send OTP via MSG91 SMS gateway.',
      }
    }
  } catch (error: any) {
    console.error('❌ MSG91 Widget Send API exception:', error?.message || error)
    return {
      success: false,
      message: 'Network or server error while connecting to MSG91 OTP service.',
    }
  }
}

/**
 * Verify OTP via MSG91 OTP Widget v5 API
 */
export async function verifyMSG91OTP(
  phone: string,
  otp: string,
  clientReqId?: string
): Promise<{ success: boolean; message: string }> {
  const formattedMobile = formatMobileNumber(phone)
  const cleanOtp = otp.trim()

  if (!cleanOtp) {
    return { success: false, message: 'Please enter a valid OTP code.' }
  }

  // Determine reqId from client parameter or server store
  const stored = widgetReqIdStore.get(formattedMobile)
  const reqId = clientReqId || stored?.reqId

  if (!reqId) {
    console.warn(`⚠️ No active MSG91 reqId found for ${formattedMobile}. Request a new OTP.`)
    return {
      success: false,
      message: 'OTP session expired or not found. Please click "Resend OTP".',
    }
  }

  try {
    console.log(`📱 [MSG91 Widget] Verifying OTP for ${formattedMobile} (reqId: ${reqId})...`)

    const response = await fetch('https://control.msg91.com/api/v5/widget/verifyOtp', {
      method: 'POST',
      headers: {
        'authkey': MSG91_AUTH_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetId: MSG91_WIDGET_ID,
        reqId: reqId,
        otp: cleanOtp,
      }),
    })

    const data = await response.json().catch(() => ({}))
    console.log('📱 [MSG91 Widget Verify API Response]:', data)

    const isSuccess = data.type === 'success' ||
                      data['access-token'] ||
                      data.message === 'OTP verified successfully' ||
                      data.message === 'already_verified'

    if (isSuccess) {
      widgetReqIdStore.delete(formattedMobile)
      return { success: true, message: 'OTP verified successfully.' }
    } else {
      return {
        success: false,
        message: data.message || 'Invalid OTP code. Please enter the correct OTP sent to your phone.',
      }
    }
  } catch (error: any) {
    console.error('❌ MSG91 Widget Verify API error:', error?.message || error)
    return {
      success: false,
      message: 'Failed to verify OTP with MSG91 server.',
    }
  }
}

