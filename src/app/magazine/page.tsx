import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const revalidate = 300

type Section = { num: string; title: string; subtitle: string; badge?: string }

export default async function MagazinePage() {
  const supabase = createClient()

  const { data: issue } = await supabase
    .from('magazine_issues')
    .select('*')
    .eq('is_published', true)
    .order('issue_number', { ascending: false })
    .single()

  const sections: Section[] = issue?.sections
    ? (issue.sections as Section[])
    : DEFAULT_SECTIONS

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">

        {/* HERO */}
        <section className="relative h-[320px] overflow-hidden photo-warm-1">
          {/* White top bar — matching the site */}
          <div className="absolute top-0 left-0 right-0 bg-white/92 px-7 py-2.5 flex items-center justify-between z-10">
            <span className="font-bebas text-[20px] tracking-[0.1em] text-mthr-black">MTHR</span>
            <span className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid font-medium">
              Issue {issue?.issue_number ?? '04'} · Spring 2026
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/45 flex flex-col items-center justify-center text-center">
            <h1 className="font-cormorant font-light text-[64px] leading-[0.95] tracking-[0.04em] text-white">
              MTHR<br /><em>Magazine</em>
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/60 mt-2.5">
              <div className="mag-deck">Family · Wedding · Love · Honest imagery</div>
            </p>
          </div>
        </section>

        {/* INDEX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-mthr-white">
          {sections.map((section, i) => (
            <div
              key={section.num}
              className={`flex items-center gap-3.5 px-7 py-[18px] border-b border-mthr-b1 cursor-pointer hover:bg-mthr-off transition-colors group
                ${i % 2 === 0 ? 'md:border-r' : ''}`}
            >
              <span className="text-[9px] tracking-[0.06em] text-mthr-dim min-w-[22px]">
                {section.num}.
              </span>
              <div className={`w-14 h-14 rounded-sm flex-shrink-0 photo-warm-${(i % 3) + 1}`} />
              <div className="flex-1">
                <div className="font-bebas text-[16px] tracking-[0.05em] text-mthr-black">
                  {section.title}
                </div>
                <div className="font-cormorant italic text-[12px] font-light text-mthr-mid mt-0.5">
                  {section.subtitle}
                </div>
              </div>
              {section.badge && (
                <span className="text-[8px] tracking-[0.1em] uppercase text-mthr-dark bg-mthr-b1 px-2 py-1 rounded-sm font-medium whitespace-nowrap">
                  {section.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* GET FEATURED CTA */}
        <section className="bg-mthr-white px-7 py-9 border-t border-mthr-b1">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-cormorant font-light text-[28px]">Get <em>featured</em></h2>
            <Link href="/submit" className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              Submit your work →
            </Link>
          </div>
          <p className="text-[12px] text-mthr-mid leading-[1.8] max-w-xl">
            Every issue of MTHR Magazine features photographers from around the world. Submit your work to be considered for print and digital features.
          </p>
        </section>

      </main>
      <Footer />
    </div>
  )
}

const DEFAULT_SECTIONS: Section[] = [
  { num: '01', title: 'WELCOME', subtitle: 'A letter from the founder' },
  { num: '02', title: 'ABOUT', subtitle: 'What MTHR stands for' },
  { num: '03', title: 'APPROACH', subtitle: 'How we see the world' },
  { num: '05', title: 'MY PROCESS', subtitle: 'Behind the approach' },
  { num: '07', title: 'PHILOSOPHY', subtitle: 'Where real life is the story' },
  { num: '08', title: 'COLLECTIONS', subtitle: 'Curated series by location', badge: 'New' },
  { num: '13', title: 'PLACES', subtitle: "The world's best family locations", badge: 'Featured' },
  { num: '15', title: 'FEATURED', subtitle: 'Sarah Okafor · Lagos', badge: 'Issue 04' },
]