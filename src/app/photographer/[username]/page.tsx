import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function PhotographerPage({ params }: { params: { username: string } }) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.eq.${params.username},id.eq.${params.username}`)
    .single()

  if (!profile) notFound()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, title, cover_image, images, subjects, location_name, location_country, category, status, created_at')
    .eq('photographer_id', profile.id)
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* Profile header */}
        <div className="bg-white px-8 py-10 border-b border-[#E8E4DE]">
          <div className="flex items-start gap-6 max-w-4xl">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 photo-warm-1">
              {profile.avatar_url && (
                <Image src={profile.avatar_url} alt={profile.full_name ?? ''} width={80} height={80} className="object-cover w-full h-full" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-cormorant font-light text-[32px] leading-none text-mthr-black">
                    {profile.full_name}
                  </h1>
                  {profile.location && (
                    <p className="text-[12px] text-mthr-mid mt-1">{profile.location}</p>
                  )}
                </div>
                {profile.is_featured && (
                  <span className="text-[8px] tracking-[0.1em] uppercase text-mthr-dark bg-[#E8E4DE] px-2.5 py-1 rounded-full font-medium">
                    featured
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-[12px] text-mthr-mid leading-[1.8] mt-3 max-w-lg">{profile.bio}</p>
              )}

              <div className="flex items-center gap-5 mt-4">
                <span className="text-[11px] text-mthr-mid">
                  <span className="font-cormorant text-[22px] font-light text-mthr-black mr-1">{profile.submission_count}</span>
                  sessions
                </span>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.12em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                    website →
                  </a>
                )}
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.1em] text-mthr-mid hover:text-mthr-black transition-colors">
                    @{profile.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Work grid */}
        <div className="px-8 py-8">
          <h2 className="font-cormorant font-light text-[24px] text-mthr-black mb-6"><em>work.</em></h2>
          {submissions && submissions.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {submissions.map(sub => {
                const img = sub.cover_image ?? sub.images?.[0] ?? null
                return (
                  <Link key={sub.id} href={`/submission/${sub.id}`}
                    className="relative break-inside-avoid block overflow-hidden group rounded-sm photo-warm-1">
                    {img && <Image src={img} alt={sub.subjects ?? sub.title} width={600} height={900} className="w-full h-auto object-cover" style={{ display: 'block' }} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col justify-end p-3">
                      {sub.subjects && <div className="font-cormorant italic text-[13px] font-light text-white">{sub.subjects}</div>}
                      <div className="text-[10px] text-white/70">{sub.location_name}</div>
                    </div>
                    {sub.status === 'featured' && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[8px] tracking-[0.08em] uppercase bg-white/90 text-mthr-dark px-2 py-0.5 rounded-full font-medium">featured</span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid">no approved submissions yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
