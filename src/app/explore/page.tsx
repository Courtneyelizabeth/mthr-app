import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import ExploreClient from './ExploreClient'

export const revalidate = 60

export default async function ExplorePage() {
  const supabase = createClient()

  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id, title, location_name, location_country, location_state,
      subjects, instagram_handle, cover_image, images,
      category, status, created_at,
      profiles:photographer_id (id, full_name, username, avatar_url, instagram)
    `)
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .order('created_at', { ascending: false })
    .limit(40)

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
        <ExploreClient
          submissions={submissions ?? []}
          photographers={photographers ?? []}
        />
      </main>
      <Footer />
    </div>
  )
}
