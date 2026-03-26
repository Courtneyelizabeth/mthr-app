import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import PlacesClient from './PlacesClient'

export const revalidate = 60

export default async function PlacesPage() {
  const supabase = createClient()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, title, location_name, location_state, location_state_code, location_country, cover_image, category, created_at, profiles:photographer_id(full_name, username)')
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .not('location_state_code', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">
        <PlacesClient submissions={submissions ?? []} />
      </main>
      <Footer />
    </div>
  )
}