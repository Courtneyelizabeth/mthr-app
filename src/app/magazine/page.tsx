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

  const sections: Section[] = issue?.sections ? (issue.sections as Section[]) : DEFAULT_SECTIONS

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* Header */}
        <div className="px-8 pt-10 pb-6 border-b border-[#E8E4DE]">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black">
                MTHR <em>Magazine.</em>
              </h1>
              <p className="text-[11px] text-mthr-mid mt-2">
                Issue {issue?.issue_number ?? '04'} · Spring 2026
              </p>
            </div>
            <div className="text-right">
              <div className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid font-medium mb-1">
                Submissions open
              </div>
              <div className="font-cormorant italic text-[16px] text-mthr-black">
                April 1 — May 1, 2026
              </div>
            </div>
          </div>
        </div>

        {/* Index grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white border-b border-[#E8E4DE]">
          {sections.map((section, i) => (
            <div key={section.num}
              className={`flex items-center gap-4 px-8 py-5 border-b border-[#E8E4DE] hover:bg-[#F5F2EE] transition-colors ${i % 2 === 0 ? 'md:border-r' : ''}`}>
              <span className="text-[9px] tracking-[0.06em] text-mthr-dim min-w-[22px]">{section.num}.</span>
              <div className={`w-14 h-14 rounded-sm flex-shrink-0 photo-warm-${(i % 3) + 1}`} />
              <div className="flex-1">
                <div className="font-cormorant text-[18px] font-light text-mthr-black">{section.title}</div>
                <div className="font-cormorant italic text-[13px] font-light text-mthr-mid">{section.subtitle}</div>
              </div>
              {section.badge && (
                <span className="text-[8px] tracking-[0.1em] uppercase text-mthr-dark bg-[#E8E4DE] px-2 py-1 rounded-full font-medium">
                  {section.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-8 py-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-cormorant font-light text-[28px] text-mthr-black">get <em>featured.</em></h2>
            <Link href="/submit" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              Submit your work →
            </Link>
          </div>
          <p className="text-[12px] text-mthr-mid leading-[1.8] max-w-xl">
            every issue of MTHR Magazine features photographers from around the world. submit your work during the open window to be considered for print and digital features.
          </p>
        </div>

      </main>
      <Footer />
    </div>
  )
}

const DEFAULT_SECTIONS: Section[] = [
  { num: '01', title: 'Welcome', subtitle: 'a letter from the founder' },
  { num: '02', title: 'About', subtitle: 'what MTHR stands for' },
  { num: '03', title: 'Approach', subtitle: 'how we see the world' },
  { num: '05', title: 'My Process', subtitle: 'behind the approach' },
  { num: '07', title: 'Philosophy', subtitle: 'where real life is the story' },
  { num: '08', title: 'Collections', subtitle: 'curated series by location', badge: 'New' },
  { num: '13', title: 'Places', subtitle: "the world's best family locations", badge: 'Featured' },
  { num: '15', title: 'Featured', subtitle: 'Sarah Okafor · Lagos', badge: 'Issue 04' },
]
