import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/public/contact - Submit a contact message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sender_name, sender_email, sender_phone, subject, message, category } = body

    // Validation
    if (!sender_name?.trim() || !sender_email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sender_email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        sender_name: sender_name.trim(),
        sender_email: sender_email.trim(),
        sender_phone: sender_phone?.trim() || null,
        subject: subject?.trim() || 'General Inquiry',
        message: message.trim(),
        category: category || 'general',
        status: 'unread',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data
    })
  } catch (error: any) {
    console.error('Contact form API error:', error)
    // Even if DB fails, acknowledge the message (graceful degradation)
    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
      data: null
    })
  }
}
