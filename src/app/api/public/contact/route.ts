import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendContactFormEmails } from '@/lib/email'

// POST /api/public/contact - Submit a contact message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sender_name, sender_email, sender_phone, subject, message, category } = body

    // Validation - only message is required
    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    let dbResult = null
    // Try inserting into DB (gracefully handles if table contact_messages is missing in schema)
    try {
      const { data, error } = await supabaseAdmin
        .from('contact_messages')
        .insert({
          sender_name: sender_name?.trim() || 'Website Visitor',
          sender_email: sender_email?.trim() || 'aagajfoundationpaliganj@gmail.com',
          sender_phone: sender_phone?.trim() || null,
          subject: subject?.trim() || 'General Inquiry',
          message: message.trim(),
          category: category || 'general',
          status: 'unread',
        })
        .select()
        .single()

      if (!error) {
        dbResult = data
      } else {
        console.warn('DB insertion notice for contact message:', error.message)
      }
    } catch (dbErr: any) {
      console.warn('DB insert catch block for contact message:', dbErr?.message)
    }

    // ALWAYS send email notifications (Admin notification + User acknowledgment)
    try {
      await sendContactFormEmails({
        sender_name: sender_name?.trim() || 'Website Visitor',
        sender_email: sender_email?.trim() || 'aagajfoundationpaliganj@gmail.com',
        sender_phone: sender_phone?.trim() || '',
        subject: subject?.trim() || 'General Inquiry',
        message: message.trim(),
        category: category || 'general',
      })
    } catch (emailErr: any) {
      console.error('Error sending contact emails:', emailErr?.message || emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data: dbResult
    })
  } catch (error: any) {
    console.error('Contact form API error:', error?.message || error)
    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
      data: null
    })
  }
}
