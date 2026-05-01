import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'

export default async function LocationPage({ params }: { params: { state: string } }) {
  const state = decodeURIComponent(params.state)
  const supabase = createClient()

  const { data: submissions } = await (supabase as any)
    .from('submissions')
    .select(`
      id, title, location_name, location_country, location_state,
      subjects, instagram_handle, cover_image, images,
      category, status, created_at,
      profiles:photographer_id (id, full_name, username, avatar_url, instagram)
    `)
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .eq('location_state', state)
    .order('created_at', { ascending: false })

  // Get unique venues within this state
  const venues: string[] = Array.from(new Set(((submissions ?? []) as any[]).map((s: any) => s.location_name as string).filter(Boolean))).sort()

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">
        <div className="px-8 pt-12 pb-6 border-b border-[#E8E4DE]">
          <Link href="/explore" className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors mb-4 block">
            ← all locations
          </Link>
          <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black mb-1">
            {state}<em>.</em>
          </h1>
          <p className="text-[12px] text-mthr-mid">{submissions?.length ?? 0} images</p>

          {/* Venue filter pills — member only */}
          {venues.length > 1 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {venues.map(venue => (
                <Link
                  key={venue}
                  href={`/locations/${encodeURIComponent(state)}?venue=${encodeURIComponent(venue)}`}
                  className="px-3 py-1 text-[9px] tracking-[0.12em] uppercase font-medium rounded-full border border-mthr-b2 text-mthr-mid hover:border-mthr-black hover:text-mthr-black transition-colors"
                >
                  {venue}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-6">
          {submissions && submissions.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {((submissions ?? []) as any[]).map((sub: any) => {
                const img = sub.cover_image ?? sub.images?.[0] ?? null
                if (!img) return null
                return (
                  <div key={sub.id} className="relative break-inside-avoid group">
                    <Link href={`/submission/${sub.id}`}>
                      <Image src={img} alt={sub.subjects ?? sub.title ?? state}
                        width={600} height={900} className="w-full h-auto object-cover rounded-sm"
                        style={{ display: 'block' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col justify-end p-3.5">
                        {sub.subjects && <div className="font-cormorant italic text-[14px] font-light text-white leading-none">{sub.subjects}</div>}
                        <div className="text-[10px] tracking-[0.08em] text-white/70 mt-0.5">{sub.location_name}</div>
                        {sub.instagram_handle && (
                          <a href={`https://instagram.com/${sub.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()} className="text-[9px] tracking-[0.08em] text-white/55 hover:text-white transition-colors mt-0.5">
                            @{sub.instagram_handle}
                          </a>
                        )}
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-cormorant italic text-[22px] font-light text-mthr-mid">no images from {state} yet.</p>
              <Link href="/submit" className="inline-block mt-4 text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                be the first to submit →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
