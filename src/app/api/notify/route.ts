import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@mthrmag.com'
const FROM_EMAIL = 'MTHR Magazine <onboarding@resend.dev>'

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  return res.ok
}

export async function POST(request: Request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
  }

  const { type, photographer_name, photographer_email, submission_title, location } = await request.json()

  if (type === 'submission_received') {
    // Email to photographer
    await sendEmail({
      to: photographer_email,
      subject: `we received your submission — ${submission_title}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
          <div style="font-size: 22px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px;">MTHR</div>
          <h1 style="font-weight: 300; font-size: 32px; margin: 0 0 8px;">thank you, <em>${photographer_name}.</em></h1>
          <p style="color: #8A8680; font-size: 14px; margin: 0 0 32px;">we received your submission and will be in touch soon.</p>
          <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 32px;" />
          <p style="font-size: 14px; color: #2A2620; margin: 0 0 8px;"><strong>${submission_title}</strong></p>
          <p style="font-size: 13px; color: #8A8680; margin: 0 0 32px;">${location}</p>
          <p style="font-size: 13px; color: #8A8680; line-height: 1.7;">
            our team reviews every submission carefully. if your work is selected you'll hear from us within 7 days.
            in the meantime, explore the community at <a href="https://mthrmag.com" style="color: #1A1814;">mthrmag.com</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 32px 0;" />
          <p style="font-size: 11px; color: #C0BCB6; letter-spacing: 0.1em; text-transform: uppercase;">
            where real life is the story. · mthrmag.com
          </p>
        </div>
      `,
    })

    // Email to you (admin)
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `new submission — ${submission_title}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
          <div style="font-size: 22px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px;">MTHR Admin</div>
          <h1 style="font-weight: 300; font-size: 28px; margin: 0 0 24px;">new submission received.</h1>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8A8680; width: 140px;">Photographer</td><td style="padding: 8px 0;">${photographer_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8680;">Email</td><td style="padding: 8px 0;">${photographer_email}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8680;">Title</td><td style="padding: 8px 0;">${submission_title}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8680;">Location</td><td style="padding: 8px 0;">${location}</td></tr>
          </table>
          <div style="margin-top: 24px;">
            <a href="https://mthrmag.com/admin" style="display: inline-block; padding: 12px 24px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;">
              Review in admin →
            </a>
          </div>
        </div>
      `,
    })
  }

  return NextResponse.json({ success: true })
}
