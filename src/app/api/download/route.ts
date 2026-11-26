import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, ITEMS } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const LIMIT = 5

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('session_id') ?? ''
  const file = url.searchParams.get('file') ?? ''
  try {
    const s = await stripe().checkout.sessions.retrieve(id)
    const allowed = ITEMS[s.metadata?.item ?? '']?.files ?? []
    if (s.payment_status !== 'paid' || !allowed.includes(file)) {
      return NextResponse.json({ error: 'not allowed' }, { status: 403 })
    }
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: row } = await sb.from('download_counts').select('count').eq('session_id', id).eq('file', file).maybeSingle()
    const used = row?.count ?? 0
    if (used >= LIMIT) {
      return new NextResponse('download limit reached for this file. please contact us and we will help.', { status: 429 })
    }
    const n = file.replace('vol', '')
    const { data, error } = await sb.storage.from('downloads').createSignedUrl(`${file}.pdf`, 600, { download: `MTHR-The-Golden-Season-Volume-${n}.pdf` })
    if (error || !data) return NextResponse.json({ error: 'file unavailable' }, { status: 500 })
    await sb.from('download_counts').upsert({ session_id: id, file, count: used + 1 })
    const res = NextResponse.redirect(data.signedUrl)
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
}
