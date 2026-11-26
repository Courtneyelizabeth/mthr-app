import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60

const MOODS = ['quiet', 'golden', 'tender', 'wild', 'ordinary', 'together', 'colorful', 'documentary', 'editorial', 'brand']

export default async function MoodPage({ searchParams }: { searchParams: { m?: string } }) {
  const supabase = createClient()
  const active = MOODS.includes(searchParams.m ?? '') ? (searchParams.m as string) : null

  const { data } = await (supabase as any)
    .from('submissions')
    .select('id, title, subjects, cover_image, images, moods, profiles:photographer_id (id, full_name)')
    .eq('submission_type', 'app')
    .in('status', ['approved', 'featured'])
    .not('moods', 'is', null)
    .order('created_at', { ascending: false })
    .limit(800)

  const tagged: any[] = (data ?? []).filter((s: any) => (s.moods ?? []).length > 0)
  const imgOf = (s: any) => s.cover_image ?? s.images?.[0] ?? null
  const hrefOf = (s: any) => (s.profiles?.id ? `/photographer/${s.profiles.id}` : '#')

  const grid = (items: any[]) => (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
      {items.map((s: any) => {
        const img = imgOf(s)
        if (!img) return null
        return (
          <Link key={s.id} href={hrefOf(s)} className="block mb-2 break-inside-avoid">
            <Image src={img} alt={s.subjects ?? s.title ?? ''} width={600} height={900}
              className="w-full h-auto object-cover" style={{ display: 'block' }} />
          </Link>
        )
      })}
    </div>
  )

  const pill = (on: boolean) =>
    `px-4 py-1.5 text-[9px] tracking-[0.14em] uppercase font-medium rounded-full transition-colors border ${
      on ? 'bg-mthr-black text-white border-mthr-black' : 'bg-transparent text-mthr-mid border-mthr-b2 hover:border-mthr-mid hover:text-mthr-black'
    }`

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1 px-4 md:px-8 py-12">
        <div className="text-center mb-10">
          <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-3">Browse by</p>
          <h1 className="font-cormorant italic font-light text-[48px] md:text-[64px] leading-[1.05] text-mthr-black">mood.</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Link href="/mood" className={pill(!active)}>all</Link>
          {MOODS.map(m => (
            <Link key={m} href={`/mood?m=${m}`} className={pill(active === m)}>{m}</Link>
          ))}
        </div>

        {tagged.length === 0 ? (
          <p className="text-center font-cormorant italic text-[20px] font-light text-mthr-mid">moods are being added. check back soon.</p>
        ) : active ? (
          grid(tagged.filter((s: any) => (s.moods ?? []).includes(active)))
        ) : (
          <div className="space-y-14">
            {MOODS.map(m => {
              const items = tagged.filter((s: any) => (s.moods ?? []).includes(m))
              if (items.length === 0) return null
              return (
                <section key={m}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="font-cormorant italic font-light text-[32px] text-mthr-black">{m}</h2>
                    <Link href={`/mood?m=${m}`} className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">see all →</Link>
                  </div>
                  {grid(items.slice(0, 8))}
                </section>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
