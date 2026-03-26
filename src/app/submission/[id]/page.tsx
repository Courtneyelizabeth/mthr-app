import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const CATEGORY_LABELS: Record<string, string> = {
  family_documentary: 'Family Documentary',
  motherhood: 'Motherhood',
  fatherhood: 'Fatherhood',
  newborn: 'Newborn',
  love_couples: 'Love & Couples',
  editorial: 'Editorial',
}

export default async function SubmissionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: sub } = await supabase
    .from('submissions')
    .select(`*, profiles:photographer_id (id, full_name, username, location, avatar_url, bio, instagram)`)
    .eq('id', params.id)
    .in('status', ['approved', 'featured'])
    .single()

  if (!sub) notFound()

  const photographer = sub.profiles as { id: string; full_name: string | null; username: string | null; location: string | null; avatar_url: string | null; bio: string | null; instagram: string | null }

  // Increment view count (fire and forget)
  supabase.from('submissions')
    .update({ view_count: (sub.view_count ?? 0) + 1 })
    .eq('id', sub.id)
    .then(() => {})

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">

        {/* COVER IMAGE */}
        <div className="relative h-[60vh] photo-warm-1 overflow-hidden">
          {sub.cover_image && (
            <Image src={sub.cover_image} alt={sub.title} fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-7 pb-8">
            {sub.status === 'featured' && (
              <span className="inline-block text-[8px] tracking-[0.12em] uppercase bg-mthr-white/90 text-mthr-dark px-2.5 py-1 rounded-sm font-medium mb-3">
                Featured
              </span>
            )}
            {sub.subjects && (
              <h1 className="font-bebas text-[36px] md:text-[52px] tracking-[0.06em] text-white leading-none">
                {sub.subjects.toUpperCase()}
              </h1>
            )}
            <p className="font-cormorant italic text-[16px] font-light text-white/75 mt-1">
              {sub.location_name}, {sub.location_country}
            </p>
            {sub.instagram_handle && (
              <a
                href={`https://instagram.com/${sub.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[9px] tracking-[0.14em] text-white/60 hover:text-white transition-colors mt-2"
              >
                @{sub.instagram_handle}
              </a>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-mthr-white px-7 py-10">
          <div className="max-w-3xl">

            {/* Meta */}
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-mthr-b1">
              <span className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid font-medium">
                {CATEGORY_LABELS[sub.category] ?? sub.category}
              </span>
              <span className="text-mthr-dim">·</span>
              <span className="text-[9px] tracking-[0.1em] text-mthr-mid">
                {new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
              {sub.magazine_issue && (
                <>
                  <span className="text-mthr-dim">·</span>
                  <span className="text-[9px] tracking-[0.1em] text-mthr-mid">{sub.magazine_issue}</span>
                </>
              )}
            </div>

            {/* Description */}
            {sub.description && (
              <p className="font-cormorant text-[16px] font-light leading-[1.9] text-mthr-dark mb-8">
                {sub.description}
              </p>
            )}

            {/* Additional images */}
            {sub.images && sub.images.length > 1 && (
              <div className="grid grid-cols-2 gap-[3px] mb-8">
                {sub.images.slice(1).map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden photo-warm-2">
                    <Image src={img} alt={`${sub.title} ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Photographer card */}
            <div className="border-t border-mthr-b1 pt-6">
              <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid font-medium mb-4">Photographer</p>
              <Link
                href={`/photographer/${photographer.username ?? photographer.id}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-sm overflow-hidden flex-shrink-0 photo-warm-3">
                  {photographer.avatar_url && (
                    <Image src={photographer.avatar_url} alt={photographer.full_name ?? ''} width={56} height={56} className="object-cover w-full h-full" />
                  )}
                </div>
                <div>
                  <div className="font-bebas text-[18px] tracking-[0.05em] text-mthr-black group-hover:opacity-70 transition-opacity">
                    {photographer.full_name?.toUpperCase()}
                  </div>
                  {photographer.location && (
                    <div className="font-cormorant italic text-[12px] font-light text-mthr-mid mt-0.5">
                      {photographer.location}
                    </div>
                  )}
                  {photographer.instagram && (
                    <a
                      href={`https://instagram.com/${photographer.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[9px] tracking-[0.1em] text-mthr-mid hover:text-mthr-black transition-colors mt-0.5 inline-block"
                    >
                      @{photographer.instagram}
                    </a>
                  )}
                </div>
                <span className="ml-auto text-[9px] tracking-[0.14em] uppercase text-mthr-mid group-hover:text-mthr-black transition-colors">
                  View profile →
                </span>
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
