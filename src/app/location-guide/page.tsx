import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import LocationGuideClient from './LocationGuideClient'

export const dynamic = 'force-dynamic'

export default async function LocationGuidePage() {
  const supabase = createClient()

  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id, title, cover_image, images, subjects,
      location_name, location_country, location_state, location_state_code,
      instagram_handle, category, created_at,
      profiles:photographer_id (full_name, username, instagram)
    `)
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .not('location_state_code', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">
        <LocationGuideClient submissions={submissions ?? []} />
      </main>
      <Footer />
    </div>
  )
}
