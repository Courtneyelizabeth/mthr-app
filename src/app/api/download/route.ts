import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, ITEMS } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const LIMIT = 3
const H = { 'Cache-Control': 'no-store' }

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const id: string = body.session_id ?? ''
  const file: string = body.file ?? ''
  try {
    const s = await stripe().checkout.sessions.retrieve(id)
    const allowed = ITEMS[s.metadata?.item ?? '']?.files ?? []
    if (s.payment_status !== 'paid' || !allowed.includes(file)) {
      return NextResponse.json({ error: 'not allowed' }, { status: 403, headers: H })
    }
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: row } = await sb.from('download_counts').select('count').eq('session_id', id).eq('file', file).maybeSingle()
    const used = row?.count ?? 0
    if (used >= LIMIT) {
      return NextResponse.json({ error: 'download limit reached for this file. please contact us and we will help.' }, { status: 429, headers: H })
    }
    const n = file.replace('vol', '')
    const { data, error } = await sb.storage.from('downloads').createSignedUrl(`${file}.pdf`, 600, { download: `MTHR-The-Golden-Season-Volume-${n}.pdf` })
    if (error || !data) return NextResponse.json({ error: 'file unavailable. please try again.' }, { status: 500, headers: H })
    await sb.from('download_counts').upsert({ session_id: id, file, count: used + 1 })
    return NextResponse.json({ url: data.signedUrl }, { headers: H })
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: H })
  }
}
