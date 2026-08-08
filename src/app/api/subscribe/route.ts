import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { email, first_name, last_name } = await req.json()

    const res = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: first_name ?? '',
        last_name: last_name ?? '',
        unsubscribed: false,
      }),
    })

    const data = await res.json()
    console.log('Resend subscribe:', res.status, JSON.stringify(data))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Subscribe error:', e)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
