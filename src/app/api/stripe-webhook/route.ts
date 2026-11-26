import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { stripe, ITEMS } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') ?? ''
  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'bad signature' }, { status: 400 })
  }
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session
    const to = s.customer_details?.email
    const item = ITEMS[s.metadata?.item ?? '']
    if (to && item && s.payment_status === 'paid') {
      const link = `https://www.mthrmag.com/download?session_id=${s.id}`
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: "MTHR Magazine <hello@mthrmag.com>",
          to,
          subject: 'your MTHR download',
          html: `<p>thank you for supporting MTHR.</p><p>your ${item.name} is ready:</p><p><a href="${link}">download your files →</a></p><p>download now and save the files somewhere safe. each file can be downloaded up to 3 times.</p><p>The MTHR Team</p>`,
        }),
      })
    }
  }
  return NextResponse.json({ received: true })
}
