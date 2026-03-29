import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { photographer_id } = await request.json()
  if (!photographer_id) return NextResponse.json({ email: null })
  const { data } = await supabase.auth.admin.getUserById(photographer_id)
  return NextResponse.json({ email: data?.user?.email ?? null })
}
