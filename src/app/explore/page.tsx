import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import ExploreClient from './ExploreClient'
import Link from 'next/link'

export const revalidate = 60

export default async function ExplorePage() {
  const supabase = createClient()

  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id, title, location_name, location_country, location_state,
      subjects, instagram_handle, cover_image, images,
      category, status, created_at, quarter_featured,
      profiles:photographer_id (id, full_name, username, avatar_url, instagram)
    `)
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .order('created_at', { ascending: false })

  // Get unique states for location filter
  const { data: locationData } = await supabase
    .from('submissions')
    .select('location_state, location_country, location_name')
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .not('location_state', 'is', null)

  const states = Array.from(new Set((locationData ?? [] as any[])
    .map((s: any) => s.location_state)
    .filter(Boolean)
  )).sort() as string[]

  const { data: photographers } = await supabase
    .from('profiles')
    .select('id, full_name, username, location, avatar_url, instagram, submission_count, is_featured')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* ── EXPLORE FEED ── */
        <ExploreClient
          submissions={submissions ?? []}
          photographers={photographers ?? []}
          states={states ?? []}
        />

      </main>
      <Footer />
    </div>
  )
}
