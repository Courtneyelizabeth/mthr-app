import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const CATEGORY_LABELS: Record<string, string> = {
  family_documentary: 'Family',
  motherhood: 'Motherhood',
  fatherhood: 'Fatherhood',
  newborn: 'Newborn',
  love_couples: 'Couples',
  editorial: 'Maternity',
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

  const photographer = sub.profiles as {
    id: string; full_name: string | null; username: string | null
    location: string | null; avatar_url: string | null; bio: string | null; instagram: string | null
  }

  supabase.from('submissions').update({ view_count: (sub.view_count ?? 0) + 1 }).eq('id', sub.id).then(() => {})

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* Cover */}
        <div className="relative overflow-hidden">
          {sub.cover_image ? (
            <Image src={sub.cover_image} alt={sub.subjects ?? sub.title} width={1400} height={900}
              className="w-full h-auto object-cover" priority style={{ display: 'block' }} />
          ) : (
            <div className="h-[60vh] photo-warm-1" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex flex-col justify-end px-8 pb-8">
            {sub.status === 'featured' && (
              <span className="inline-block text-[8px] tracking-[0.12em] uppercase bg-white/90 text-mthr-dark px-2.5 py-1 rounded-full font-medium mb-3 self-start">
                Featured
              </span>
            )}
            {sub.subjects && (
              <p className="text-[11px] tracking-[0.08em] text-white/70 mt-1">
                {sub.subjects.startsWith('@') ? (
                  <a href={`https://instagram.com/${sub.subjects.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{sub.subjects}</a>
                ) : sub.subjects}
              </p>
            )}
            <p className="font-cormorant text-[16px] font-light text-white/75 mt-1">
              {sub.location_name}, {sub.location_country}
            </p>
            {sub.instagram_handle && (
              <span className="text-[10px] tracking-[0.1em] text-white/55 mt-1">
                @{sub.instagram_handle}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white px-8 py-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E8E4DE] text-[10px] tracking-[0.1em] text-mthr-mid">
              <span>{CATEGORY_LABELS[sub.category] ?? sub.category}</span>
              <span>·</span>
              <span>{new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
            </div>

            {sub.description && (
              <p className="font-cormorant text-[17px] font-light leading-[1.9] text-mthr-dark mb-8">
                {sub.description}
              </p>
            )}

            {sub.images && sub.images.length > 1 && (
              <div className="columns-2 gap-2 space-y-2 mb-8">
                {sub.images.slice(1).map((img, i) => (
                  <div key={i} className="break-inside-avoid">
                    <Image src={img} alt={`${sub.title} ${i + 2}`} width={800} height={1000}
                      className="w-full h-auto object-cover rounded-sm" style={{ display: 'block' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Photographer */}
            <div className="border-t border-[#E8E4DE] pt-6">
              <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid font-medium mb-4">photographer</p>
              <Link href={`/photographer/${photographer.username ?? photographer.id}`} className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 photo-warm-1">
                  {photographer.avatar_url && (
                    <Image src={photographer.avatar_url} alt={photographer.full_name ?? ''} width={56} height={56} className="object-cover w-full h-full" />
                  )}
                </div>
                <div>
                  <div className="font-cormorant text-[20px] font-light text-mthr-black group-hover:opacity-60 transition-opacity">
                    {photographer.full_name}
                  </div>
                  {photographer.location && (
                    <div className="text-[11px] text-mthr-mid mt-0.5">{photographer.location}</div>
                  )}
                  {photographer.instagram && (
                    <a href={`https://instagram.com/${photographer.instagram}`} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] tracking-[0.08em] text-mthr-mid hover:text-mthr-black transition-colors mt-0.5 inline-block">
                      @{photographer.instagram}
                    </a>
                  )}
                </div>
                <span className="ml-auto text-[10px] tracking-[0.12em] uppercase text-mthr-mid group-hover:text-mthr-black transition-colors">
                  view work →
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
