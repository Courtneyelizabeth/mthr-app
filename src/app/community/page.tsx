import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import CommunityClient from './CommunityClient'

export const revalidate = 60

export default async function CommunityPage() {
  const supabase = createClient()

  // Login required
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/community')

  const { data: posts } = await supabase
    .from('community_posts')
    .select(`*, profiles:photographer_id (full_name, username, instagram)`)
    .eq('is_approved', true)
    .order('event_date', { ascending: true })

  const { data: project365 } = await supabase
    .from('project_365')
    .select(`*, profiles:photographer_id (full_name, username, avatar_url)`)
    .order('created_at', { ascending: false })
    .limit(60)

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">
        <CommunityClient posts={posts ?? []} project365={project365 ?? []} userId={user.id} />
      </main>
      <Footer />
    </div>
  )
}
