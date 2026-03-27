import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hecklercourtney@gmail.com'
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
    console.error('Failed to parse request body:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { type, photographer_name, photographer_email, submission_title, location } = body

  console.log('Notify called:', { type, photographer_name, photographer_email, submission_title })

  try {
    // Email to photographer
    if (photographer_email) {
      const r1 = await fetch('https://api.resend.com/emails', {
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
              <div style="font-size: 22px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px;">MTHR</div>
              <h1 style="font-weight: 300; font-size: 32px; margin: 0 0 8px;">thank you, <em>${photographer_name}.</em></h1>
              <p style="color: #8A8680; font-size: 14px; margin: 0 0 32px;">we received your submission and will be in touch soon.</p>
              <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 32px;" />
              <p style="font-size: 14px; color: #2A2620; margin: 0 0 8px;"><strong>${submission_title}</strong></p>
              <p style="font-size: 13px; color: #8A8680; margin: 0 0 32px;">${location}</p>
              <p style="font-size: 13px; color: #8A8680; line-height: 1.7;">our team reviews every submission carefully. if your work is selected you'll hear from us within 7 days.</p>
              <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 32px 0;" />
              <p style="font-size: 11px; color: #C0BCB6; letter-spacing: 0.1em; text-transform: uppercase;">where real life is the story. · mthrmag.com</p>
            </div>
          `,
        }),
      })
      const r1data = await r1.json()
      console.log('Photographer email result:', r1.status, JSON.stringify(r1data))
    }

    // Email to admin
    const r2 = await fetch('https://api.resend.com/emails', {
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
            <div style="font-size: 22px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px;">MTHR Admin</div>
            <h1 style="font-weight: 300; font-size: 28px; margin: 0 0 24px;">new submission received.</h1>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #8A8680; width: 140px;">Photographer</td><td style="padding: 8px 0;">${photographer_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #8A8680;">Email</td><td style="padding: 8px 0;">${photographer_email}</td></tr>
              <tr><td style="padding: 8px 0; color: #8A8680;">Title</td><td style="padding: 8px 0;">${submission_title}</td></tr>
              <tr><td style="padding: 8px 0; color: #8A8680;">Location</td><td style="padding: 8px 0;">${location}</td></tr>
            </table>
            <div style="margin-top: 24px;">
              <a href="https://mthrmag.com/admin" style="display: inline-block; padding: 12px 24px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;">Review in admin →</a>
            </div>
          </div>
        `,
      }),
    })
    const r2data = await r2.json()
    console.log('Admin email result:', r2.status, JSON.stringify(r2data))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
