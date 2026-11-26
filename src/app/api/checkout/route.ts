import { NextResponse } from 'next/server'
import { stripe, ITEMS } from '@/lib/stripe'

export async function POST(req: Request) {
  const { item } = await req.json()
  const it = ITEMS[item]
  if (!it) return NextResponse.json({ error: 'bad item' }, { status: 400 })
  const origin = req.headers.get('origin') ?? 'https://mthrmag.com'
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: it.cents, product_data: { name: `MTHR — ${it.name}` } } }],
    metadata: { item },
    success_url: `${origin}/download?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/read`,
  })
  return NextResponse.json({ url: session.url })
}
