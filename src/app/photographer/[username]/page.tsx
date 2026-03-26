import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function PhotographerPage({ params }: { params: { username: string } }) {
  const supabase = createClient()

  // Try username first, then fall back to id
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.eq.${params.username},id.eq.${params.username}`)
    .single()

  if (!profile) notFound()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, title, location_name, location_country, cover_image, category, status, created_at')
    .eq('photographer_id', profile.id)
    .in('status', ['approved', 'featured'])
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">

        {/* PROFILE HEADER */}
        <section className="bg-mthr-white px-7 py-10 border-b border-mthr-b1">
          <div className="flex items-start gap-6 max-w-4xl">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 photo-warm-1">
              {profile.avatar_url && (
                <Image src={profile.avatar_url} alt={profile.full_name ?? ''} width={80} height={80} className="object-cover w-full h-full" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-bebas text-[28px] tracking-[0.05em] text-mthr-black leading-none">
                    {profile.full_name?.toUpperCase()}
                  </h1>
                  {profile.location && (
                    <p className="font-cormorant italic text-[14px] font-light text-mthr-mid mt-1">
                      {profile.location}
                    </p>
                  )}
                </div>
                {profile.is_featured && (
                  <span className="text-[8px] tracking-[0.1em] uppercase text-mthr-dark bg-mthr-b1 px-2 py-1 rounded-sm font-medium">
                    Featured
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-[12px] text-mthr-mid leading-[1.8] mt-3 max-w-lg">{profile.bio}</p>
              )}

              <div className="flex items-center gap-5 mt-4">
                <span className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid">
                  <span className="font-bebas text-[18px] tracking-[0.04em] text-mthr-black mr-1">{profile.submission_count}</span>
                  sessions
                </span>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                    Website →
                  </a>
                )}
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                    @{profile.instagram}
                  </a>
                )}              </div>
            </div>
          </div>
        </section>

        {/* SUBMISSIONS GRID */}
        <section className="bg-mthr-off px-7 py-9">
          <h2 className="font-cormorant font-light text-[24px] text-mthr-black mb-5">
            <em>Work</em>
          </h2>

          {submissions && submissions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px]">
              {submissions.map(sub => (
                <Link key={sub.id} href={`/submission/${sub.id}`}
                  className="relative aspect-[4/3] overflow-hidden group photo-warm-1 cursor-pointer"
                >
                  {sub.cover_image && (
                    <Image src={sub.cover_image} alt={sub.title} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5">
                    <div className="font-bebas text-[13px] tracking-[0.05em] text-white">{sub.title.toUpperCase()}</div>
                    <div className="font-cormorant italic text-[11px] font-light text-white/70 mt-0.5">
                      {sub.location_name}, {sub.location_country}
                    </div>
                  </div>
                  {sub.status === 'featured' && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[8px] tracking-[0.08em] uppercase bg-mthr-white/90 text-mthr-dark px-2 py-0.5 rounded-sm font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid">No approved submissions yet.</p>
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  )
}
