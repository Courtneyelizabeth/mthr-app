import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SubmissionRedirect({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: sub } = await (supabase as any)
    .from('submissions')
    .select('photographer_id, profiles:photographer_id (id)')
    .eq('id', params.id)
    .single()

  const profileId = sub?.profiles?.id ?? sub?.photographer_id

  if (profileId) {
    redirect(`/photographer/${profileId}`)
  } else {
    redirect('/explore')
  }
}
