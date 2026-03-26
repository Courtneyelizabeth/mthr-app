import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60 // ISR — revalidate every 60s

export default async function ExplorePage() {
  const supabase = createClient()

  // Fetch approved + featured submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id, title, location_name, location_country,
      cover_image, category, status, created_at,
      profiles:photographer_id (id, full_name, username, avatar_url)
    `)
    .in('status', ['approved', 'featured'])
    .order('created_at', { ascending: false })
    .limit(12)

  // Fetch featured photographers
  const { data: photographers } = await supabase
    .from('profiles')
    .select('id, full_name, username, location, avatar_url, submission_count, is_featured')
    .eq('is_featured', true)
    .order('submission_count', { ascending: false })
    .limit(4)

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative h-[420px] overflow-hidden photo-warm-1">
          <div className="absolute top-[18px] left-6 text-[10px] tracking-[0.08em] text-white/45">20</div>
          <div className="absolute top-[18px] right-6 text-[10px] tracking-[0.08em] text-white/45">26</div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/45 flex flex-col items-center justify-center text-center px-10">
            <p className="text-[9px] tracking-[0.22em] uppercase text-white/65 font-medium mb-3">
              Documentary honest imagery
            </p>
            <h1 className="font-cormorant font-light text-[72px] leading-[0.95] tracking-[0.04em] text-white">
              MTHR<br /><em>Magazine</em>
            </h1>
            <p className="text-[9px] tracking-[0.18em] uppercase text-white/60 mt-3">
              Families · Love · Motherhood · Fatherhood
            </p>
            <Link href="/submit" className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-transparent border border-white/60 text-white text-[9px] tracking-[0.16em] uppercase font-medium rounded-sm hover:bg-white/10 transition-colors">
              Submit your work →
            </Link>
          </div>
        </section>

        {/* ── PHOTO GRID ── */}
        <section className="bg-mthr-white px-7 pt-9 pb-0">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-cormorant font-light text-[28px] tracking-[0.02em]">
              Latest <em>work</em>
            </h2>
            <span className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid">
              {submissions?.length ?? 0} submissions
            </span>
          </div>

          {submissions && submissions.length > 0 ? (
            <div className="grid grid-cols-3 gap-[3px]">
              {submissions.slice(0, 6).map((sub, i) => (
                <Link
                  key={sub.id}
                  href={`/submission/${sub.id}`}
                  className={`relative overflow-hidden group cursor-pointer photo-warm-${(i % 3) + 1} ${
                    i === 0 || i === 3 ? 'row-span-2' : ''
                  }`}
                  style={{ minHeight: i === 0 || i === 3 ? '320px' : '158px' }}
                >
                  {sub.cover_image ? (
                    <Image
                      src={sub.cover_image}
                      alt={sub.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5">
                    <div className="font-bebas text-[14px] tracking-[0.06em] text-white">
                      {sub.title.toUpperCase()}
                    </div>
                    <div className="font-cormorant italic text-[11px] font-light text-white/75 mt-0.5">
                      {sub.location_name}, {sub.location_country}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty state — before any submissions */
            <div className="grid grid-cols-3 gap-[3px]">
              {['photo-warm-1','photo-bw-1','photo-warm-2','photo-warm-3','photo-bw-2','photo-warm-1'].map((cls, i) => (
                <div key={i} className={`relative ${cls} ${i === 0 || i === 3 ? 'row-span-2' : ''}`}
                  style={{ minHeight: i === 0 || i === 3 ? '320px' : '158px' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[9px] tracking-[0.16em] uppercase text-white/50 font-medium">Coming soon</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── FEATURED PHOTOGRAPHERS ── */}
        <section className="bg-mthr-white px-7 pt-9 pb-9">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-cormorant font-light text-[28px] tracking-[0.02em]">
              <em>Featured</em> photographers
            </h2>
            <Link href="/magazine" className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              See magazine →
            </Link>
          </div>

          <div className="border-t border-mthr-b1">
            {photographers && photographers.length > 0 ? (
              photographers.map((p, i) => (
                <Link key={p.id} href={`/photographer/${p.username || p.id}`} className="index-row group">
                  <span className="text-[9px] tracking-[0.06em] text-mthr-dim min-w-[22px]">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <div className="w-[52px] h-[52px] rounded-sm overflow-hidden flex-shrink-0 photo-warm-1">
                    {p.avatar_url && (
                      <Image src={p.avatar_url} alt={p.full_name ?? ''} width={52} height={52} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bebas text-[16px] tracking-[0.05em] text-mthr-black">
                      {p.full_name?.toUpperCase()}
                    </div>
                    <div className="font-cormorant italic text-[12px] font-light text-mthr-mid mt-0.5">
                      {p.location} · {p.submission_count} sessions
                    </div>
                  </div>
                  <span className="text-[8px] tracking-[0.1em] uppercase text-mthr-dark bg-mthr-b1 px-2 py-1 rounded-sm font-medium">
                    Featured
                  </span>
                  <span className="text-[12px] text-mthr-dim group-hover:text-mthr-black transition-colors">→</span>
                </Link>
              ))
            ) : (
              /* Placeholder rows */
              [
                { num: '01', name: 'SARAH OKAFOR', detail: 'Lagos, Nigeria · Documentary family' },
                { num: '02', name: 'MARC DELACROIX', detail: 'Paris, France · Motherhood & newborn' },
                { num: '03', name: 'YUKI TANAKA', detail: 'Tokyo, Japan · Editorial family' },
              ].map((row) => (
                <div key={row.num} className="index-row">
                  <span className="text-[9px] tracking-[0.06em] text-mthr-dim min-w-[22px]">{row.num}.</span>
                  <div className="w-[52px] h-[52px] rounded-sm overflow-hidden flex-shrink-0 photo-warm-2" />
                  <div className="flex-1">
                    <div className="font-bebas text-[16px] tracking-[0.05em] text-mthr-black">{row.name}</div>
                    <div className="font-cormorant italic text-[12px] font-light text-mthr-mid mt-0.5">{row.detail}</div>
                  </div>
                  <span className="text-[8px] tracking-[0.1em] uppercase text-mthr-dark bg-mthr-b1 px-2 py-1 rounded-sm font-medium">Featured</span>
                  <span className="text-[12px] text-mthr-dim">→</span>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
