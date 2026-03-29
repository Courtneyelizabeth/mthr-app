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

  // Send approved or featured email
  if ((type === 'approved' || type === 'featured') && photographer_email) {
    const isFeature = type === 'featured'
    const approvedRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [photographer_email],
        subject: isFeature ? `you've been featured on MTHR` : `your work has been approved on MTHR`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
            <div style="font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px; font-family: sans-serif;">MTHR</div>
            <h1 style="font-weight: 300; font-size: 32px; margin: 0 0 6px;">${isFeature ? 'congratulations,' : 'good news,'} <em>${photographer_name}.</em></h1>
            <p style="color: #8A8680; font-size: 15px; margin: 0 0 28px; font-style: italic;">${isFeature ? 'your work has been featured on MTHR.' : 'your work has been approved and is now live on MTHR.'}</p>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 28px;" />
            <p style="font-size: 14px; color: #2A2620; line-height: 1.8; margin: 0 0 24px;">${isFeature ? 'your image is now featured on the MTHR explore feed — seen by photographers and families who believe real moments matter most.' : 'your image is now live on the MTHR explore feed. thank you for sharing your work with the community.'}</p>
            <p style="font-size: 14px; color: #2A2620; line-height: 1.8; margin: 0 0 28px;">share it, celebrate it. this work deserves to be seen.</p>
            <a href="https://mthrmag.com/explore" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">view on MTHR &rarr;</a>
            ${isFeature ? `
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 32px 0 28px;" />
            <p style="font-size: 12px; color: #8A8680; margin: 0 0 20px; font-family: sans-serif; letter-spacing: 0.05em;">your featured badges — right-click to save, or drag into photoshop as an overlay.</p>
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 32px;">
              <tr>
                <td style="width: 50%; text-align: center; padding: 16px 8px 8px;">
                  <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/mthr-badge-dark.svg" width="160" height="160" alt="MTHR featured badge dark" style="display: block; margin: 0 auto;" />
                  <p style="font-size: 10px; color: #C0BCB6; letter-spacing: 0.08em; text-transform: uppercase; font-family: sans-serif; margin: 8px 0 0;">dark</p>
                </td>
                <td style="width: 50%; text-align: center; padding: 16px 8px 8px; background: #F5F2EE;">
                  <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/mthr-badge-clear.svg" width="160" height="160" alt="MTHR featured badge clear" style="display: block; margin: 0 auto;" />
                  <p style="font-size: 10px; color: #C0BCB6; letter-spacing: 0.08em; text-transform: uppercase; font-family: sans-serif; margin: 8px 0 0;">clear</p>
                </td>
              </tr>
            </table>` : ''}
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 20px;" />
            <p style="font-size: 11px; color: #C0BCB6; letter-spacing: 0.1em; text-transform: uppercase; font-family: sans-serif; margin: 0;">where real life is the story. &middot; mthrmag.com</p>
          </div>
        `,
      }),
    })
    const approvedData = await approvedRes.json()
    console.log('Approval/feature email:', approvedRes.status, JSON.stringify(approvedData))
    results.push({ to: 'photographer-status', status: approvedRes.status })
  }

  // Send featured email (old block — now replaced above)
  if (type === 'featured' && photographer_email) {
    const featuredRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [photographer_email],
        subject: `you've been featured on MTHR`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
            <div style="font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px; font-family: sans-serif;">MTHR</div>
            <h1 style="font-weight: 300; font-size: 32px; margin: 0 0 6px;">congratulations, <em>${photographer_name}.</em></h1>
            <p style="color: #8A8680; font-size: 15px; margin: 0 0 28px; font-style: italic;">your work has been featured on MTHR.</p>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 28px;" />
            <p style="font-size: 14px; color: #2A2620; line-height: 1.8; margin: 0 0 24px;">your image is now live on the MTHR explore feed — seen by photographers and families who believe real moments matter most.</p>
            <p style="font-size: 14px; color: #2A2620; line-height: 1.8; margin: 0 0 28px;">share it, celebrate it. this work deserves to be seen.</p>
            <a href="https://mthrmag.com/explore" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">view your feature &rarr;</a>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 32px 0 28px;" />
            <p style="font-size: 12px; color: #8A8680; margin: 0 0 20px; font-family: sans-serif; letter-spacing: 0.05em;">your featured badges — right-click to save, or drag into photoshop as an overlay.</p>
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 32px;">
              <tr>
                <td style="width: 50%; text-align: center; padding: 16px 8px 8px;">
                  <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/mthr-badge-dark_1.svg" width="160" height="160" alt="MTHR featured badge dark" style="display: block; margin: 0 auto;" />
                  <p style="font-size: 10px; color: #C0BCB6; letter-spacing: 0.08em; text-transform: uppercase; font-family: sans-serif; margin: 8px 0 0;">dark</p>
                </td>
                <td style="width: 50%; text-align: center; padding: 16px 8px 8px; background: #F5F2EE;">
                  <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/mthr-badge-clear.svg" width="160" height="160" alt="MTHR featured badge clear" style="display: block; margin: 0 auto;" />
                  <p style="font-size: 10px; color: #C0BCB6; letter-spacing: 0.08em; text-transform: uppercase; font-family: sans-serif; margin: 8px 0 0;">clear</p>
                </td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 20px;" />
            <p style="font-size: 11px; color: #C0BCB6; letter-spacing: 0.1em; text-transform: uppercase; font-family: sans-serif; margin: 0;">where real life is the story. &middot; mthrmag.com</p>
          </div>
        `,
      }),
    })
    const featuredData = await featuredRes.json()
    console.log('Featured email:', featuredRes.status, JSON.stringify(featuredData))
    results.push({ to: 'featured', status: featuredRes.status })
  }

  return NextResponse.json({ success: true, results })
}
