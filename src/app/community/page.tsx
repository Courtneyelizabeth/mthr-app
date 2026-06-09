import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import CommunityClient from './CommunityClient'

export const revalidate = 60

export default async function CommunityPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: contentDays } = await (supabase as any)
    .from('content_days')
    .select('*')
    .eq('is_active', true)
    .order('event_date', { ascending: true })

  const { data: openCalls } = await (supabase as any)
    .from('open_calls')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const { data: promptSubmissions } = await (supabase as any)
    .from('prompt_submissions')
    .select('id, image_url, caption, profiles:photographer_id (id, full_name, username, avatar_url)')
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: false })

  const { data: photographers } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, username, location, avatar_url, instagram')
    .eq('for_hire', true)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1 bg-[#F5F2EE]">
        <CommunityClient
          contentDays={contentDays ?? []}
          openCalls={openCalls ?? []}
          promptSubmissions={promptSubmissions ?? []}
          photographers={photographers ?? []}
          userId={user?.id ?? null}
        />
      </main>
      <Footer />
    </div>
  )
}
