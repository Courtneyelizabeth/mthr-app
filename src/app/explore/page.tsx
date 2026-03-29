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
      category, status, created_at,
      profiles:photographer_id (id, full_name, username, avatar_url, instagram)
    `)
    .in('status', ['approved', 'featured'])
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

        {/* ── HERO SECTION ── */}
        <section className="text-center px-8 pt-16 pb-12 border-b border-[#E8E4DE]">

          {/* Main headline — big statement */}
          <h1 className="font-cormorant font-light text-[13px] md:text-[15px] tracking-[0.22em] uppercase text-mthr-black mb-4">
            family photography. elevated.
          </h1>

          {/* Poetic anchor */}
          <p className="font-cormorant italic font-light text-[42px] sm:text-[56px] md:text-[72px] leading-[0.95] text-mthr-black mb-5">
            where real life<br />is the story.
          </p>

          {/* Warm welcome */}
          <p className="text-[13px] text-mthr-mid mb-3">
            a home for the photographers who believe real moments matter most.
          </p>
          <p className="text-[12px] text-mthr-dim mb-10 tracking-[0.04em]">
            community, curation, and a magazine — all in one place.
          </p>

          {/* Feature buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              { href: '/submit',         label: 'Submit your work' },
              { href: '/magazine',       label: 'Print magazine' },
              { href: '/location-guide', label: 'Location guide' },
              { href: '/community',      label: 'Photographer community' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-5 py-2 text-[10px] tracking-[0.14em] uppercase font-medium border border-mthr-b2 text-mthr-black rounded-full hover:bg-mthr-black hover:text-white hover:border-mthr-black transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Magazine

          {/* Magazine submission banner */}
          <div className="mt-10 mx-auto max-w-2xl bg-mthr-black text-white px-8 py-4 rounded-sm flex items-center justify-center gap-6">
            <span className="text-[9px] tracking-[0.2em] uppercase font-medium text-white/60">
              Magazine submissions open
            </span>
            <span className="font-cormorant italic text-[20px] font-light">
              April 1 — May 1, 2026
            </span>
          </div>

          {/* Feature pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto text-center">
            {[
              { icon: '◎', title: 'Submit & be featured', desc: 'share your work on the app and instagram' },
              { icon: '□', title: 'Print magazine', desc: 'get published in a tangible, curated edition' },
              { icon: '◇', title: 'Location guide', desc: 'discover and share the best shoot locations' },
              { icon: '○', title: 'Community', desc: 'workshops, content days, photographer connection' },
            ].map((p) => (
              <div key={p.title} className="flex flex-col items-center gap-2">
                <span className="text-[18px] text-mthr-mid">{p.icon}</span>
                <p className="font-cormorant text-[15px] font-light text-mthr-black">{p.title}</p>
                <p className="text-[10px] text-mthr-mid leading-[1.6]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURED THIS WEEK ── */}
        <ExploreClient
          submissions={submissions ?? []}
          photographers={photographers ?? []}
        />

      </main>
      <Footer />
    </div>
  )
}
