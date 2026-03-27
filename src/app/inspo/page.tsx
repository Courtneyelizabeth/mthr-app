import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 0

export default async function InspoPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/inspo')

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      submission_id,
      submissions (
        id, title, cover_image, images, subjects,
        location_name, location_country, instagram_handle, category,
        profiles:photographer_id (full_name, username)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const saved = favorites?.map(f => f.submissions).filter(Boolean) ?? []

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">
        <div className="px-8 pt-10 pb-6 border-b border-[#E8E4DE]">
          <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black">
            saved <em>inspo.</em>
          </h1>
          <p className="text-[11px] text-mthr-mid mt-2">
            {saved.length} image{saved.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <div className="px-8 py-8">
          {saved.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {saved.map((sub: any) => {
                const img = sub.cover_image ?? sub.images?.[0] ?? null
                if (!img) return null
                return (
                  <Link
                    key={sub.id}
                    href={`/submission/${sub.id}`}
                    className="relative break-inside-avoid block overflow-hidden group rounded-sm"
                  >
                    <Image
                      src={img}
                      alt={sub.subjects ?? sub.title}
                      width={600}
                      height={900}
                      className="w-full h-auto object-cover rounded-sm"
                      style={{ display: 'block' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col justify-end p-3.5">
                      {sub.subjects && (
                        <div className="font-cormorant italic text-[14px] font-light text-white">
                          {sub.subjects}
                        </div>
                      )}
                      <div className="text-[10px] text-white/70">{sub.location_name}</div>
                      {sub.instagram_handle && (
                        <div className="text-[9px] text-white/55">@{sub.instagram_handle}</div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-cormorant italic text-[22px] font-light text-mthr-mid">
                no saved images yet.
              </p>
              <Link href="/explore" className="inline-block mt-4 text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                browse the feed →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
