import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CopyProfileButton from './CopyProfileButton'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .or(`username.eq.${params.username},id.eq.${params.username}`)
    .single()
  if (!profile) return {}
  return {
    title: `${profile.full_name} — MTHR Magazine`,
    description: profile.bio ?? `documentary family photography by ${profile.full_name}. featured on MTHR Magazine.`,
    openGraph: {
      title: `${profile.full_name} — MTHR Magazine`,
      description: profile.bio ?? `documentary family photography by ${profile.full_name}.`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

export default async function PhotographerPage({ params }: { params: { username: string } }) {
  const supabase = createClient()

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*')
    .or(`username.eq.${params.username},id.eq.${params.username}`)
    .single()

  if (!profile) notFound()

  const { data: appSubmissions } = await (supabase as any)
    .from('submissions')
    .select('id, title, cover_image, images, subjects, location_name, location_country, category, status, created_at')
    .eq('photographer_id', profile.id)
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'app')
    .order('created_at', { ascending: false })

  const { data: magSubmissions } = await (supabase as any)
    .from('submissions')
    .select('id, title, cover_image, images, subjects, location_name, status, created_at, gallery_link')
    .eq('photographer_id', profile.id)
    .in('status', ['approved', 'featured'])
    .eq('submission_type', 'magazine')
    .order('created_at', { ascending: false })

  const featuredCount = (appSubmissions ?? []).filter((s: any) => s.status === 'featured').length
  const profileUrl = `https://mthrmag.com/photographer/${profile.username ?? profile.id}`
  const initials = (profile.full_name ?? 'M').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* Profile header */}
        <div className="bg-white px-6 md:px-8 py-8 border-b border-[#E8E4DE]">
          <div className="max-w-4xl">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 bg-[#E8E4DE] flex items-center justify-center">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.full_name ?? ''} width={60} height={60} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-[18px] font-medium text-mthr-mid">{initials}</span>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="font-cormorant font-light text-[28px] leading-none text-mthr-black">{profile.full_name}</h1>
                    {profile.location && (
                      <p className="text-[12px] text-mthr-mid mt-1">{profile.location}</p>
                    )}
                  </div>
                  {(profile.is_featured || featuredCount > 0) && (
                    <span className="flex-shrink-0 text-[8px] tracking-[0.1em] uppercase text-mthr-dark bg-[#E8E4DE] px-2.5 py-1 rounded-full font-medium">
                      featured
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-[12px] text-mthr-mid leading-[1.8] mt-3 max-w-lg">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-[#E8E4DE]">
              <div className="flex items-baseline gap-1.5">
                <span className="font-cormorant text-[22px] font-light text-mthr-black">{appSubmissions?.length ?? 0}</span>
                <span className="text-[11px] text-mthr-mid">sessions</span>
              </div>
              {featuredCount > 0 && (
                <>
                  <div className="w-px h-4 bg-[#E8E4DE]" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-cormorant text-[22px] font-light text-mthr-black">{featuredCount}</span>
                    <span className="text-[11px] text-mthr-mid">featured</span>
                  </div>
                </>
              )}
              {profile.instagram && (
                <>
                  <div className="w-px h-4 bg-[#E8E4DE] hidden md:block" />
                  <span className="text-[11px] text-mthr-mid">@{profile.instagram}</span>
                </>
              )}
              <div className="ml-auto flex gap-2">
                <CopyProfileButton url={profileUrl} />
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] tracking-[0.14em] uppercase font-medium px-4 py-2 bg-mthr-black text-white hover:bg-mthr-dark transition-colors rounded-sm">
                    instagram →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Work grid */}
        <div className="px-6 md:px-8 py-8">
          <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-5">work on MTHR</p>
          {appSubmissions && appSubmissions.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {(appSubmissions as any[]).map((sub: any) => {
                const img = sub.cover_image ?? sub.images?.[0] ?? null
                if (!img) return null
                return (
                  <Link key={sub.id} href={`/submission/${sub.id}`}
                    className="relative break-inside-avoid block overflow-hidden group rounded-sm photo-warm-1">
                    <Image src={img} alt={sub.subjects ?? sub.title ?? ''} width={600} height={900}
                      className="w-full h-auto object-cover" style={{ display: 'block' }} />
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
            <div className="py-16 text-center border border-dashed border-[#D0CCC6] rounded-sm">
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid mb-3">no approved submissions yet.</p>
              <Link href="/submit" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors border-b border-[#D0CCC6] pb-px">
                submit your work →
              </Link>
            </div>
          )}
        </div>

        {/* Magazine section */}
        {magSubmissions && magSubmissions.length > 0 && (
          <div className="px-6 md:px-8 pb-8 border-t border-[#E8E4DE] pt-6">
            <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-5">in the magazine</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(magSubmissions as any[]).map((sub: any) => (
                <div key={sub.id} className="bg-white border border-[#E8E4DE] rounded-sm p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-cormorant text-[18px] font-light text-mthr-black mb-0.5">{sub.title}</p>
                    <p className="text-[11px] text-mthr-mid">{sub.location_name}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[8px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full font-medium ${sub.status === 'featured' ? 'bg-mthr-black text-white' : 'bg-[#E8E4DE] text-mthr-dark'}`}>
                      {sub.status === 'featured' ? 'selected for print' : 'under consideration'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
