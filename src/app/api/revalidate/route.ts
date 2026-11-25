import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  revalidatePath('/explore')
  revalidatePath('/location-guide')
  return NextResponse.json({ ok: true })
}
