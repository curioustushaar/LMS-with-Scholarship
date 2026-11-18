import nodemailer from 'nodemailer'

const getEmailUser = () => process.env.EMAIL_USER || 'aagajfoundationpaliganj@gmail.com'

function getTransporter() {
  const EMAIL_USER = getEmailUser()
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
    connectionTimeout: 5000, // 5s connection timeout
    greetingTimeout: 5000,   // 5s greeting timeout
    socketTimeout: 7000,     // 7s socket timeout
  } as any)

  return { transporter, EMAIL_USER }
}

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
    const { transporter, EMAIL_USER } = getTransporter()
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
      to: getEmailUser(),
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
            ${amount !== undefined && amount !== null && amount !== '' ? `<tr><td style="padding: 6px 0; color: #4b5563;">Fee Amount Paid:</td><td style="font-weight: bold; color: #059669;">${Number(amount) === 0 ? '₹0.00 (Exempted / Free)' : `₹${amount}`}</td></tr>` : ''}
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

/**
 * Send Workshop/Training Registration Confirmation Email
 */
export async function sendWorkshopRegistrationEmail(data: {
  to: string
  student_name: string
  student_phone: string
  workshop_title: string
  duration_badge?: string
  timing?: string
  start_date?: string
  platform?: string
  meeting_link: string
  meeting_id?: string
  passcode?: string
}) {
  const {
    to,
    student_name,
    workshop_title,
    duration_badge,
    timing,
    start_date,
    platform = 'Google Meet',
    meeting_link,
    meeting_id,
    passcode,
  } = data

  const subject = `🎉 Confirmed: Your Seat for ${workshop_title} | GRAVITY Training`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #FF2D8D, #9C27FF); padding: 28px; text-align: center; border-radius: 12px 12px 0 0; color: white;">
        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          ${duration_badge || 'Live Workshop'}
        </span>
        <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 800;">Registration Confirmed!</h1>
        <p style="margin: 0; font-size: 13px; opacity: 0.95;">GRAVITY Workshops & Industry Training</p>
      </div>

      <!-- Body Content -->
      <div style="padding: 24px; color: #333333; line-height: 1.6;">
        <p style="font-size: 15px;">Dear <strong>${student_name}</strong>,</p>
        <p style="font-size: 14px; color: #475569;">
          Congratulations! Your seat has been successfully reserved for <strong>${workshop_title}</strong>. Below are your live session credentials and instructions to join:
        </p>

        <!-- Workshop Credentials Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 130px; font-weight: bold;">Workshop:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${workshop_title}</td>
            </tr>
            ${start_date ? `<tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Start Date:</td>
              <td style="padding: 6px 0; color: #0f172a;">${start_date}</td>
            </tr>` : ''}
            ${timing ? `<tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Daily Timings:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; color: #FF2D8D;">${timing}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Platform:</td>
              <td style="padding: 6px 0; color: #0f172a;">${platform}</td>
            </tr>
            ${meeting_id ? `<tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Meeting ID:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace;">${meeting_id}</td>
            </tr>` : ''}
            ${passcode ? `<tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Passcode:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${passcode}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Call to Action Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meeting_link}" target="_blank" style="background: linear-gradient(135deg, #FF2D8D, #9C27FF); color: #ffffff; padding: 14px 32px; font-weight: bold; border-radius: 999px; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(255,45,141,0.35);">
            🚀 Join ${platform} Meeting Now
          </a>
          <p style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
            Link: <a href="${meeting_link}" style="color: #9C27FF; text-decoration: underline;">${meeting_link}</a>
          </p>
        </div>

        <p style="font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          <strong>Tip:</strong> Please join the session 5 minutes prior to the scheduled start time with a stable internet connection. Keep a notebook handy!
        </p>

        <p style="margin-top: 24px; font-size: 14px;">
          Warm regards,<br />
          <strong>Workshop & Academic Coordination Team</strong><br />
          GRAVITY by AAGAJ Foundation<br />
          <span style="font-size: 12px; color: #94a3b8;">Patna, Bihar | aagajfoundationpaliganj@gmail.com</span>
        </p>
      </div>
    </div>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Send Student Login Credentials Email
 */
export async function sendStudentCredentialsEmail(data: {
  to: string
  student_name: string
  student_id?: string
  email: string
  password: string
  phone?: string
  student_class?: string
  school_coaching?: string
}) {
  const { to, student_name, student_id, email, password, phone, student_class, school_coaching } = data
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aagajfoundation.in'
  const loginUrl = `${APP_URL}/login`

  const subject = `🎓 Welcome to GRAVITY LMS - Your Student Account Login Credentials`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #C81E4E, #D91E5B); padding: 28px 24px; text-align: center; border-radius: 12px 12px 0 0; color: white;">
        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          Student Access Portal
        </span>
        <h1 style="margin: 12px 0 4px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Welcome to GRAVITY LMS!</h1>
        <p style="margin: 0; font-size: 13px; opacity: 0.95;">AAGAJ Foundation Learning Management System</p>
      </div>

      <!-- Content -->
      <div style="padding: 24px; line-height: 1.6;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${student_name}</strong>,</p>
        <p style="font-size: 14px; color: #475569;">
          Your student account has been successfully created on the <strong>GRAVITY LMS</strong> portal. You can now log in to access your assigned courses, learning modules, projects, quizzes, and certificates.
        </p>

        <!-- Credentials Card -->
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 14px 0; color: #9f1239; font-size: 16px; font-weight: 700; border-bottom: 1px solid #fecdd3; padding-bottom: 8px;">
            🔑 Your Login Credentials
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 7px 0; color: #475569; width: 140px; font-weight: 600;">Login Portal:</td>
              <td style="padding: 7px 0;"><a href="${loginUrl}" style="color: #C81E4E; text-decoration: underline; font-weight: 600;">${loginUrl}</a></td>
            </tr>
            ${student_id ? `
            <tr>
              <td style="padding: 7px 0; color: #475569; font-weight: 600;">Student ID:</td>
              <td style="padding: 7px 0;"><code style="background: #ffffff; border: 1px solid #fda4af; padding: 3px 8px; border-radius: 4px; font-family: Courier, monospace; font-size: 14px; font-weight: 700; color: #0f172a;">${student_id}</code></td>
            </tr>` : ''}
            <tr>
              <td style="padding: 7px 0; color: #475569; font-weight: 600;">Username (Email):</td>
              <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #475569; font-weight: 600;">Temporary Password:</td>
              <td style="padding: 7px 0;">
                <code style="background: #ffffff; border: 1px solid #fda4af; padding: 4px 10px; border-radius: 6px; font-family: Courier, monospace; font-size: 15px; font-weight: 700; color: #be123c; letter-spacing: 0.5px;">${password}</code>
              </td>
            </tr>
            ${student_class ? `
            <tr>
              <td style="padding: 7px 0; color: #475569; font-weight: 600;">Class / Grade:</td>
              <td style="padding: 7px 0; color: #0f172a;">${student_class}</td>
            </tr>` : ''}
            ${school_coaching ? `
            <tr>
              <td style="padding: 7px 0; color: #475569; font-weight: 600;">School / Coaching:</td>
              <td style="padding: 7px 0; color: #0f172a;">${school_coaching}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #C81E4E, #D91E5B); color: #ffffff; padding: 14px 34px; font-weight: 700; border-radius: 999px; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(200,30,78,0.35);">
            🚀 Login to LMS Portal
          </a>
        </div>

        <!-- Security Tip -->
        <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #92400e;">
            <strong>⚠️ Security Notice:</strong> Please keep this password confidential. We strongly recommend changing your password right after your first successful login.
          </p>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Need assistance? Feel free to reach out to us at <a href="mailto:aagajfoundationpaliganj@gmail.com" style="color: #C81E4E;">aagajfoundationpaliganj@gmail.com</a> or helpline <strong>+91 9431430464</strong>.
        </p>

        <p style="margin-top: 18px; font-size: 14px;">
          Best wishes for your learning journey,<br />
          <strong>Academic & Support Team</strong><br />
          GRAVITY by AAGAJ Foundation<br />
          <span style="font-size: 12px; color: #94a3b8;"><a href="https://aagajfoundation.in" style="color: #94a3b8; text-decoration: none;">https://aagajfoundation.in</a></span>
        </p>
      </div>
    </div>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Send Administrator Login Credentials Email
 */
export async function sendAdminCredentialsEmail(data: {
  to: string
  admin_name: string
  email: string
  password: string
  phone?: string
}) {
  const { to, admin_name, email, password, phone } = data
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aagajfoundation.in'
  const loginUrl = `${APP_URL}/login`

  const subject = `🛡️ Welcome to GRAVITY Administration - Your Admin Portal Credentials`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 28px 24px; text-align: center; border-radius: 12px 12px 0 0; color: white;">
        <span style="background: rgba(200,30,78,0.3); border: 1px solid rgba(200,30,78,0.5); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #fda4af;">
          Admin Access Granted
        </span>
        <h1 style="margin: 12px 0 4px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Welcome to Administration</h1>
        <p style="margin: 0; font-size: 13px; opacity: 0.9;">GRAVITY LMS Management Portal</p>
      </div>

      <!-- Content -->
      <div style="padding: 24px; line-height: 1.6;">
        <p style="font-size: 15px; margin-top: 0;">Dear <strong>${admin_name}</strong>,</p>
        <p style="font-size: 14px; color: #475569;">
          Your Administrator account has been successfully created by the Superadmin on the <strong>GRAVITY LMS</strong> platform. You now have administrative privileges to manage assigned courses, students, evaluations, and projects.
        </p>

        <!-- Credentials Card -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 14px 0; color: #0f172a; font-size: 16px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            🔐 Admin Login Credentials
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 7px 0; color: #64748b; width: 140px; font-weight: 600;">Login Portal:</td>
              <td style="padding: 7px 0;"><a href="${loginUrl}" style="color: #C81E4E; text-decoration: underline; font-weight: 600;">${loginUrl}</a></td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Role:</td>
              <td style="padding: 7px 0;"><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">ADMIN</span></td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Email (Username):</td>
              <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Temporary Password:</td>
              <td style="padding: 7px 0;">
                <code style="background: #ffffff; border: 1px solid #94a3b8; padding: 4px 10px; border-radius: 6px; font-family: Courier, monospace; font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: 0.5px;">${password}</code>
              </td>
            </tr>
          </table>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #C81E4E, #D91E5B); color: #ffffff; padding: 14px 34px; font-weight: 700; border-radius: 999px; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(200,30,78,0.35);">
            ⚡ Access Admin Dashboard
          </a>
        </div>

        <!-- Security Tip -->
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #991b1b;">
            <strong>🔒 Administrative Security Notice:</strong> Admin access grants privileged controls over the platform. Do NOT share your credentials with anyone. Please change your password upon your first login.
          </p>
        </div>

        <p style="margin-top: 24px; font-size: 14px;">
          Best Regards,<br />
          <strong>Superadmin Directorate</strong><br />
          GRAVITY by AAGAJ Foundation<br />
          <span style="font-size: 12px; color: #94a3b8;"><a href="https://aagajfoundation.in" style="color: #94a3b8; text-decoration: none;">https://aagajfoundation.in</a></span>
        </p>
      </div>
    </div>
  `

  return sendEmail({ to, subject, html })
}


