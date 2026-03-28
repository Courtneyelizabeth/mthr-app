import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hecklercourtney@gmail.com'

// Use Resend's shared domain which works without full verification
const FROM_EMAIL = 'MTHR Magazine <onboarding@resend.dev>'

export async function POST(request: Request) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
  }

  let body: any
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { type, photographer_name, photographer_email, submission_title, location } = body
  console.log('Notify:', { type, photographer_name, photographer_email, submission_title })

  const results = []

  // Always send admin notification
  const adminRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `new submission — ${submission_title}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
          <div style="font-size: 20px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 24px;">MTHR</div>
          <h1 style="font-weight: 300; font-size: 26px; margin: 0 0 20px;">new submission received.</h1>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 8px 0; color: #8A8680; width: 140px; border-bottom: 1px solid #E8E4DE;">Photographer</td><td style="padding: 8px 0; border-bottom: 1px solid #E8E4DE;">${photographer_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8680; border-bottom: 1px solid #E8E4DE;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #E8E4DE;">${photographer_email}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8680; border-bottom: 1px solid #E8E4DE;">Title</td><td style="padding: 8px 0; border-bottom: 1px solid #E8E4DE;">${submission_title}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8680;">Location</td><td style="padding: 8px 0;">${location}</td></tr>
          </table>
          <a href="https://mthrmag.com/admin" style="display: inline-block; padding: 12px 24px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;">Review in admin →</a>
        </div>
      `,
    }),
  })
  const adminData = await adminRes.json()
  console.log('Admin email:', adminRes.status, JSON.stringify(adminData))
  results.push({ to: 'admin', status: adminRes.status })

  // Send photographer confirmation — only if email provided
  if (photographer_email && photographer_email.length > 3) {
    const photoRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [photographer_email],
        subject: `we received your submission — ${submission_title}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
            <div style="font-size: 20px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 24px;">MTHR</div>
            <h1 style="font-weight: 300; font-size: 28px; margin: 0 0 8px;">thank you, <em>${photographer_name}.</em></h1>
            <p style="color: #8A8680; font-size: 14px; margin: 0 0 28px;">we received your submission and will be in touch soon.</p>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 28px;" />
            <p style="font-size: 14px; color: #2A2620; margin: 0 0 6px; font-weight: 600;">${submission_title}</p>
            <p style="font-size: 13px; color: #8A8680; margin: 0 0 28px;">${location}</p>
            <p style="font-size: 13px; color: #8A8680; line-height: 1.8; margin: 0 0 28px;">our team reviews every submission carefully. if your work is selected you'll hear from us within 7 days. in the meantime, explore the community at <a href="https://mthrmag.com" style="color: #1A1814;">mthrmag.com</a>.</p>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 24px;" />
            <p style="font-size: 11px; color: #C0BCB6; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">where real life is the story. · mthrmag.com</p>
          </div>
        `,
      }),
    })
    const photoData = await photoRes.json()
    console.log('Photographer email:', photoRes.status, JSON.stringify(photoData))
    results.push({ to: 'photographer', status: photoRes.status, data: photoData })
  }

  return NextResponse.json({ success: true, results })
}
