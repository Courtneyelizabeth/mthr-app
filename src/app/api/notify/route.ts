import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hecklercourtney@gmail.com'

// Use Resend's shared domain which works without full verification
const FROM_EMAIL = 'MTHR Magazine <hello@mthrmag.com>'

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

  const { type, submission_type, photographer_name, photographer_email, submission_title, location, gallery_link } = body
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

  // Send type-aware approval/featured email
  if ((type === 'approved' || type === 'featured') && photographer_email) {
    const isFeature = type === 'featured'
    const isMagazine = submission_type === 'magazine'
    const isArticle = submission_type === 'article'

    // Build subject and body based on submission type
    let subject = ''
    let headline = ''
    let subline = ''
    let body = ''
    let cta = ''
    let showBadges = false

    if (isArticle) {
      if (isFeature) {
        subject = `your article has been selected for MTHR`
        headline = `congratulations, <em>${photographer_name}.</em>`
        subline = `your article has been selected for publication on MTHR.`
        body = `your writing will be featured on the MTHR platform and considered for the print magazine. we'll be in touch with next steps. thank you for sharing your voice with our community.`
        cta = `<a href="https://mthrmag.com" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">visit mthrmag.com &rarr;</a>`
      } else {
        subject = `we received your article — MTHR`
        headline = `thank you, <em>${photographer_name}.</em>`
        subline = `your article is under review.`
        body = `our team reviews every submission carefully. if your article is selected you'll hear from us within 22 days. we're so glad you're here.`
        cta = ``
      }
    } else if (isMagazine) {
      if (isFeature) {
        subject = `your work has been selected for the MTHR print magazine`
        headline = `congratulations, <em>${photographer_name}.</em>`
        subline = `your work has been selected for the MTHR print magazine.`
        body = `this is what it's all for. your images will be featured in a tangible, printed edition that does justice to the craft. we'll be in touch with details about your feature. thank you for trusting us with your work.`
        cta = `<a href="https://mthrmag.com/magazine" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">visit mthrmag.com &rarr;</a>`
      } else {
        subject = `we're reviewing your magazine submission — MTHR`
        headline = `good news, <em>${photographer_name}.</em>`
        subline = `your submission is under consideration for the MTHR print magazine.`
        body = `our team reviews every magazine submission carefully and personally. selected photographers will be notified and their work featured in a tangible, printed edition. magazine submissions are reviewed within 22 days.`
        cta = ``
      }
    } else {
      // App/Instagram
      if (isFeature) {
        subject = `you've been featured on MTHR`
        headline = `congratulations, <em>${photographer_name}.</em>`
        subline = `your work has been featured on MTHR.`
        body = `your image is now featured on the MTHR explore feed — seen by photographers and families who believe real moments matter most. share it, celebrate it. this work deserves to be seen.`
        cta = `<a href="https://mthrmag.com/explore" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">view on MTHR &rarr;</a>`
        showBadges = true
      } else {
        subject = `your work is live on MTHR`
        headline = `good news, <em>${photographer_name}.</em>`
        subline = `your work has been approved and is now live on MTHR.`
        body = `your image is now on the MTHR explore feed. thank you for sharing your work with the community.`
        cta = `<a href="https://mthrmag.com/explore" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">view on MTHR &rarr;</a>`
      }
    }

    const badgesHtml = showBadges ? `
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
      </table>` : ''

    const statusRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [photographer_email],
        subject,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
            <div style="font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px; font-family: sans-serif;">MTHR</div>
            <h1 style="font-weight: 300; font-size: 32px; margin: 0 0 6px;">${headline}</h1>
            <p style="color: #8A8680; font-size: 15px; margin: 0 0 28px; font-style: italic;">${subline}</p>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 28px;" />
            <p style="font-size: 14px; color: #2A2620; line-height: 1.8; margin: 0 0 28px;">${body}</p>
            ${cta}
            ${badgesHtml}
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 20px;" />
            <p style="font-size: 11px; color: #C0BCB6; letter-spacing: 0.1em; text-transform: uppercase; font-family: sans-serif; margin: 0;">where real life is the story. &middot; mthrmag.com</p>
          </div>
        `,
      }),
    })
    const statusData = await statusRes.json()
    console.log('Status email:', statusRes.status, JSON.stringify(statusData))
    results.push({ to: 'photographer-status', status: statusRes.status })
  }

  // Send type-aware status email
  if ((type === 'approved' || type === 'featured') && photographer_email) {
    const isFeature = type === 'featured'
    const isMagazine = submission_type === 'magazine'
    const isArticle = submission_type === 'article'

    let subject = '', headline = '', subline = '', body = '', cta = '', showBadges = false

    if (isArticle) {
      if (isFeature) {
        subject = `your article has been selected for MTHR`
        headline = `congratulations, <em>${photographer_name}.</em>`
        subline = `your article has been selected for publication on MTHR.`
        body = `your writing will be featured on the MTHR platform and considered for the print magazine. we will be in touch with next steps. thank you for sharing your voice with our community.`
        cta = `<a href="https://mthrmag.com" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">visit mthrmag.com &rarr;</a>`
      } else {
        subject = `your article is under review — MTHR`
        headline = `thank you, <em>${photographer_name}.</em>`
        subline = `your article is under review.`
        body = `our team reviews every submission carefully. if your article is selected you will hear from us within 22 days. we are so glad you are here.`
        cta = ``
      }
    } else if (isMagazine) {
      if (isFeature) {
        subject = `your work has been selected for the MTHR print magazine`
        headline = `congratulations, <em>${photographer_name}.</em>`
        subline = `your work has been selected for the MTHR print magazine.`
        body = `this is what it is all for. your images will be featured in a tangible, printed edition that does justice to the craft. we will be in touch with details about your feature. thank you for trusting us with your work.`
        cta = `<a href="https://mthrmag.com/magazine" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">visit mthrmag.com &rarr;</a>`
      } else {
        subject = `your magazine submission is under consideration — MTHR`
        headline = `good news, <em>${photographer_name}.</em>`
        subline = `your submission is under consideration for the MTHR print magazine.`
        body = `our team reviews every magazine submission carefully and personally. selected photographers will be notified and their work featured in a tangible, printed edition. magazine submissions are reviewed within 22 days.`
        cta = ``
      }
    } else {
      if (isFeature) {
        subject = `you have been featured on MTHR`
        headline = `congratulations, <em>${photographer_name}.</em>`
        subline = `your work has been featured on MTHR.`
        body = `your image is now featured on the MTHR explore feed — seen by photographers and families who believe real moments matter most. share it, celebrate it. this work deserves to be seen.`
        cta = `<a href="https://mthrmag.com/explore" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">view on MTHR &rarr;</a>`
        showBadges = true
      } else {
        subject = `your work is live on MTHR`
        headline = `good news, <em>${photographer_name}.</em>`
        subline = `your work has been approved and is now live on MTHR.`
        body = `your image is now on the MTHR explore feed. thank you for sharing your work with the community.`
        cta = `<a href="https://mthrmag.com/explore" style="display: inline-block; padding: 13px 28px; background: #1A1814; color: white; text-decoration: none; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-family: sans-serif; margin-bottom: 32px;">view on MTHR &rarr;</a>`
      }
    }

    const badgesHtml = showBadges ? `
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
      </table>` : ''

    const statusRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [photographer_email],
        subject,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
            <div style="font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 32px; font-family: sans-serif;">MTHR</div>
            <h1 style="font-weight: 300; font-size: 32px; margin: 0 0 6px;">${headline}</h1>
            <p style="color: #8A8680; font-size: 15px; margin: 0 0 28px; font-style: italic;">${subline}</p>
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 28px;" />
            <p style="font-size: 14px; color: #2A2620; line-height: 1.8; margin: 0 0 28px;">${body}</p>
            ${cta}
            ${badgesHtml}
            <hr style="border: none; border-top: 1px solid #E8E4DE; margin: 0 0 20px;" />
            <p style="font-size: 11px; color: #C0BCB6; letter-spacing: 0.1em; text-transform: uppercase; font-family: sans-serif; margin: 0;">where real life is the story. &middot; mthrmag.com</p>
          </div>
        `,
      }),
    })
    const statusData = await statusRes.json()
    console.log('Status email:', statusRes.status, JSON.stringify(statusData))
    results.push({ to: 'photographer-status', status: statusRes.status })
  }

  return NextResponse.json({ success: true, results })
}
