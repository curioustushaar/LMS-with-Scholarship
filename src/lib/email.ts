import nodemailer from 'nodemailer'

const EMAIL_USER = process.env.EMAIL_USER || ''
const EMAIL_PASS = process.env.EMAIL_PASS || ''

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  family: 4, // Force IPv4 to prevent IPv6 ConnectTimeoutError on Windows
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
} as any)

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Generic email sender
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"GRAVITY by AAGAJ Foundation" <${EMAIL_USER}>`,
      to,
      subject,
      text: text || subject,
      html,
    })
    console.log('✉️ Email sent successfully:', info.messageId, 'to:', to)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send Contact Form Emails (Admin notification + User acknowledgment)
 */
export async function sendContactFormEmails(data: {
  sender_name: string
  sender_email: string
  sender_phone?: string
  category?: string
  subject?: string
  message: string
}) {
  const { sender_name, sender_email, sender_phone, category, subject, message } = data

  // 1. Notification Email to Organization (aagajfoundationpaliganj@gmail.com)
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #FF2D8D, #9C27FF); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
        <h2 style="margin: 0; font-size: 22px;">New Contact Form Message</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">GRAVITY by AAGAJ Foundation</p>
      </div>
      <div style="padding: 20px; color: #333333;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${sender_name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${sender_email}">${sender_email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${sender_phone || 'Not provided'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Category:</td><td><span style="text-transform: uppercase; font-size: 12px; background: #f0f0f0; padding: 3px 8px; border-radius: 4px;">${category || 'General'}</span></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Subject:</td><td>${subject || 'General Inquiry'}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <h3 style="margin-top: 0; color: #111111;">Message Content:</h3>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>
      <div style="background-color: #f5f5f7; padding: 12px; text-align: center; font-size: 12px; color: #888888; border-radius: 0 0 8px 8px;">
        This email was sent automatically from GRAVITY Website Contact Form (https://aagajfoundation.in)
      </div>
    </div>
  `

  // 2. Acknowledgment Email to User
  const userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #FF2D8D, #9C27FF); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
        <h2 style="margin: 0; font-size: 22px;">Thank You for Reaching Out!</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">GRAVITY by AAGAJ Foundation</p>
      </div>
      <div style="padding: 20px; color: #333333; line-height: 1.6;">
        <p>Dear <strong>${sender_name}</strong>,</p>
        <p>We have received your message regarding <strong>"${subject || 'General Inquiry'}"</strong>. Our academic counselors and support team will review your message and get back to you shortly.</p>
        <div style="background: #fdf2f8; border-left: 4px solid #FF2D8D; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #be185d;"><strong>Need immediate assistance?</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #475569;">Call our support helpline at <strong>+91 9431430464</strong> or email us at <a href="mailto:aagajfoundationpaliganj@gmail.com">aagajfoundationpaliganj@gmail.com</a>.</p>
        </div>
        <p>Best Regards,<br /><strong>Academic & Support Team</strong><br />GRAVITY by AAGAJ Foundation<br /><a href="https://aagajfoundation.in">https://aagajfoundation.in</a></p>
      </div>
    </div>
  `

  await Promise.allSettled([
    sendEmail({
      to: EMAIL_USER,
      subject: `[Contact Form] ${subject || 'New Inquiry'} from ${sender_name}`,
      html: adminHtml,
    }),
    sendEmail({
      to: sender_email,
      subject: `Message Received - GRAVITY by AAGAJ Foundation`,
      html: userHtml,
    }),
  ])
}

/**
 * Send Scholarship Application & Payment Confirmation Email
 */
export async function sendScholarshipPaymentEmail(data: {
  applicant_name: string
  applicant_email: string
  application_no: string
  registration_code: string
  scholarship_title: string
  father_name?: string
  payment_reference?: string
  amount?: string | number
}) {
  const {
    applicant_name,
    applicant_email,
    application_no,
    registration_code,
    scholarship_title,
    father_name,
    payment_reference,
    amount,
  } = data

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 24px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Registration Successful!</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">GRAVITY Scholarship Examination 2026</p>
      </div>
      <div style="padding: 24px; color: #333333; line-height: 1.6;">
        <p>Dear <strong>${applicant_name}</strong>,</p>
        <p>Congratulations! Your application for <strong>${scholarship_title}</strong> has been successfully registered and confirmed.</p>
        
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 18px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #047857; font-size: 16px; border-b: 1px solid #a7f3d0; padding-bottom: 8px;">Registration Details</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #4b5563; width: 160px;">Application Number:</td><td style="font-weight: bold; color: #065f46;">${application_no}</td></tr>
            <tr><td style="padding: 6px 0; color: #4b5563;">Security Code:</td><td style="font-weight: bold; color: #065f46;">${registration_code}</td></tr>
            <tr><td style="padding: 6px 0; color: #4b5563;">Candidate Name:</td><td style="font-weight: bold;">${applicant_name}</td></tr>
            ${father_name ? `<tr><td style="padding: 6px 0; color: #4b5563;">Father's Name:</td><td>${father_name}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #4b5563;">Scholarship Scheme:</td><td>${scholarship_title}</td></tr>
            ${payment_reference ? `<tr><td style="padding: 6px 0; color: #4b5563;">Transaction Ref:</td><td style="font-family: monospace;">${payment_reference}</td></tr>` : ''}
            ${amount ? `<tr><td style="padding: 6px 0; color: #4b5563;">Fee Amount Paid:</td><td style="font-weight: bold; color: #059669;">₹${amount}</td></tr>` : ''}
          </table>
        </div>

        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #1e293b;"><strong>📌 Next Steps & Hall Ticket Download:</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #475569;">
            Keep your <strong>Application Number</strong> and <strong>Security Code</strong> safe. When Admit Cards or Examination Schedules are announced, you can download your Official Hall Ticket by visiting <a href="https://aagajfoundation.in/scholarships">https://aagajfoundation.in/scholarships</a>.
          </p>
        </div>

        <p>For any queries, reach out to <a href="mailto:aagajfoundationpaliganj@gmail.com">aagajfoundationpaliganj@gmail.com</a> or call <strong>+91 9431430464</strong>.</p>
        <p>Best of Luck,<br /><strong>Scholarship Examination Authority</strong><br />GRAVITY by AAGAJ Foundation</p>
      </div>
    </div>
  `

  return sendEmail({
    to: applicant_email,
    subject: `Application Confirmation: ${application_no} - GRAVITY Scholarship`,
    html,
  })
}

/**
 * Send Bulk Announcement Email (Admit Card Released / Result Announced)
 */
export async function sendAnnouncementEmail(data: {
  to: string
  applicant_name: string
  type: 'ADMIT_CARD' | 'RESULT'
  title: string
  details?: string
}) {
  const { to, applicant_name, type, title, details } = data

  const isAdmitCard = type === 'ADMIT_CARD'
  const subject = isAdmitCard
    ? `Important: Download Your Admit Card - ${title} | GRAVITY`
    : `Result Announced: ${title} | GRAVITY`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, ${isAdmitCard ? '#FF2D8D, #9C27FF' : '#2563EB, #4F46E5'}); padding: 24px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">${isAdmitCard ? '🎟️ Admit Cards Released!' : '🎉 Examination Results Announced!'}</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">GRAVITY by AAGAJ Foundation</p>
      </div>
      <div style="padding: 24px; color: #333333; line-height: 1.6;">
        <p>Dear <strong>${applicant_name}</strong>,</p>
        <p>We are pleased to inform you that official updates regarding <strong>${title}</strong> are now available.</p>
        
        <div style="background: #f1f5f9; padding: 18px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">${isAdmitCard ? 'Admit Card Instructions' : 'Result & Scorecard'}</h3>
          <p style="margin: 0; font-size: 14px; color: #334155;">${details || (isAdmitCard ? 'Your examination hall ticket is ready for download. Please log in with your Application Number and Mobile OTP.' : 'Your scholarship score and merit rank have been published online.')}</p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="https://aagajfoundation.in/scholarships" style="background: linear-gradient(135deg, #FF2D8D, #9C27FF); color: white; padding: 12px 28px; font-weight: bold; border-radius: 999px; text-decoration: none; display: inline-block; font-size: 14px; shadow: 0 4px 12px rgba(255,45,141,0.2);">
            ${isAdmitCard ? 'Download Hall Ticket Now' : 'Check Your Result & Scorecard'}
          </a>
        </div>

        <p>Best Regards,<br /><strong>Examination & Academic Directorate</strong><br />GRAVITY by AAGAJ Foundation</p>
      </div>
    </div>
  `

  return sendEmail({ to, subject, html })
}
