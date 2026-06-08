'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  instagram: string | null
}

type Submission = {
  id: string
  title: string
  location_name: string
  location_country: string
  location_state: string | null
  subjects: string | null
  instagram_handle: string | null
  cover_image: string | null
  images: string[]
  category: string
  status: string
  created_at: string
  quarter_featured: boolean | null
  profiles: Profile | null
}

type Photographer = {
  id: string
  full_name: string | null
  username: string | null
  location: string | null
  avatar_url: string | null
  instagram: string | null
  submission_count: number
  is_featured: boolean
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'motherhood', label: 'Motherhood' },
  { value: 'family_documentary', label: 'Family' },
  { value: 'editorial', label: 'Maternity' },
  { value: 'kids', label: 'Kids' },
  { value: 'other', label: 'Other' },
]

export default function ExploreClient({
  submissions,
  photographers,
  states,
}: {
  submissions: Submission[]
  photographers: Photographer[]
  states: string[]
}) {
  const supabase = createClient()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeState, setActiveState] = useState('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        supabase
          .from('favorites')
          .select('submission_id')
          .eq('user_id', data.user.id)
          .then(({ data: favs }) => {
            if (favs) setFavorites(new Set((favs as any[]).map((f: any) => f.submission_id)))
          })
      }
    })
  }, [])

  const toggleFavorite = async (e: React.MouseEvent, submissionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) { window.location.href = '/login'; return }
    if (favorites.has(submissionId)) {
      await (supabase.from('favorites') as any).delete().eq('user_id', userId).eq('submission_id', submissionId)
      setFavorites(prev => { const n = new Set(prev); n.delete(submissionId); return n })
    } else {
      await (supabase.from('favorites') as any).insert({ user_id: userId, submission_id: submissionId })
      setFavorites(prev => new Set(Array.from(prev).concat(submissionId)))
    }
  }

  const quarterFeatured = submissions.filter(s => s.quarter_featured)
  const heroSubmission = quarterFeatured[0] ?? submissions[0] ?? null
  const heroImg = heroSubmission?.cover_image ?? heroSubmission?.images?.[0] ?? null

  const filtered = submissions
    .filter(s => activeCategory === 'all' || s.category === activeCategory)
    .filter(s => activeState === 'all' || s.location_state === activeState)

  const profileHref = (sub: Submission) =>
    sub.profiles?.id ? `/photographer/${sub.profiles.id}` : '#'

  return (
    <div>
      {/* HERO — editorial text + portrait magazine cover */}
      <div className="bg-[#F5F2EE] border-b border-[#E8E4DE] px-8 py-10 md:px-16 md:py-14">
        <p className="text-[9px] tracking-[0.22em] uppercase text-mthr-mid mb-6">motherhood photography. elevated.</p>
        <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-start max-w-5xl">

          {/* Left — text */}
          <div className="flex-1">
            <p className="font-cormorant italic font-light text-[42px] md:text-[58px] leading-[1.0] text-mthr-black mb-4">
              where real life<br />is the story.
            </p>
            <p className="text-[12px] text-mthr-mid leading-[1.8] mb-8">
              a home for the photographers who find beauty in the ordinary.
            </p>

            <div className="w-8 h-px bg-[#D0CCC6] mb-5" />

            <p className="text-[9px] tracking-[0.18em] uppercase text-mthr-dim mb-1">edition one · the long light</p>
            <p className="font-cormorant italic text-[15px] text-mthr-black mb-2">get your copy.</p>
            <a href="https://www.magcloud.com/browse/issue/3341060?__r=8718597" target="_blank" rel="noopener noreferrer" className="inline-block text-[9px] tracking-[0.14em] uppercase text-mthr-mid border-b border-[#D0CCC6] hover:text-mthr-black hover:border-mthr-black transition-colors pb-px mb-6">
              buy on magcloud →
            </a>

            <div className="w-8 h-px bg-[#E8E4DE] mb-5" />

            <p className="text-[9px] tracking-[0.18em] uppercase text-mthr-mid mb-1">full bloom — edition two</p>
            <p className="font-cormorant italic text-[15px] text-mthr-black mb-2">submissions open june 26th</p>
            <Link href="/submit" className="inline-block text-[9px] tracking-[0.18em] uppercase text-mthr-mid border-b border-[#D0CCC6] hover:text-mthr-black hover:border-mthr-black transition-colors pb-px">
              submit your work →
            </Link>
          </div>

          {/* Right — magazine cover portrait */}
          <a href="https://www.magcloud.com/browse/issue/3341060?__r=8718597" target="_blank" rel="noopener noreferrer"
            className="block relative w-full md:w-[320px] lg:w-[380px] flex-shrink-0 overflow-hidden group">
            <Image
              src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/MTHRMAGCOVER.jpg"
              alt="MTHR Magazine — The Long Light, Edition One"
              width={520}
              height={693}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-4">
              <p className="text-[8px] tracking-[0.16em] uppercase text-white/60">click to purchase</p>
            </div>
          </a>

        </div>
      </div>

      {/* FILTER BAR */}
      <div className="sticky top-0 z-20 bg-[#F5F2EE] border-b border-[#E8E4DE] px-4 md:px-8 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-1.5 text-[9px] tracking-[0.14em] uppercase font-medium rounded-full transition-colors border ${
                activeCategory === cat.value
                  ? 'bg-mthr-black text-white border-mthr-black'
                  : 'bg-transparent text-mthr-mid border-mthr-b2 hover:border-mthr-mid hover:text-mthr-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <div className="w-px h-5 bg-[#E8E4DE] self-center flex-shrink-0 mx-1" />
          <button
            onClick={() => setActiveState('all')}
            className={`flex-shrink-0 px-4 py-1.5 text-[9px] tracking-[0.14em] uppercase font-medium rounded-full transition-colors border ${
              activeState === 'all'
                ? 'bg-mthr-black text-white border-mthr-black'
                : 'bg-transparent text-mthr-mid border-mthr-b2 hover:border-mthr-mid hover:text-mthr-black'
            }`}
          >
            all locations
          </button>
          {states.map(state => (
            <button
              key={state}
              onClick={() => setActiveState(state)}
              className={`flex-shrink-0 px-3 py-1.5 text-[9px] tracking-[0.14em] uppercase font-medium rounded-full transition-colors border ${
                activeState === state
                  ? 'bg-mthr-black text-white border-mthr-black'
                  : 'bg-transparent text-mthr-mid border-mthr-b2 hover:border-mthr-mid hover:text-mthr-black'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="px-2 md:px-4 py-4">
        {filtered.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-2 space-y-2">
            {filtered.map((sub, idx) => {
              const img = sub.cover_image ?? sub.images?.[0] ?? null
              if (!img) return null
              const isFav = favorites.has(sub.id)

              return (
                <div key={sub.id} className="relative break-inside-avoid group">
                  {/* Every ~9 images insert magazine banner */}
                  {idx === 8 && (
                    <div className="break-inside-avoid mb-2">
                      <Link href="/submit" className="block bg-mthr-black px-5 py-6">
                        <p className="text-[8px] tracking-[0.2em] uppercase text-white/40 mb-1">full bloom — edition two</p>
                        <p className="font-cormorant italic font-light text-[20px] text-white leading-tight mb-3">submissions open june 26th</p>
                        <p className="text-[8px] tracking-[0.16em] uppercase text-white/50 border-b border-white/20 inline-block pb-px">submit your work →</p>
                      </Link>
                    </div>
                  )}
                  <Link href={profileHref(sub)}>
                    <Image
                      src={img}
                      alt={sub.subjects ?? sub.title ?? ''}
                      width={600}
                      height={900}
                      className="w-full h-auto object-cover"
                      style={{ display: 'block' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      {sub.subjects && (
                        <div className="font-cormorant italic text-[22px] font-light text-white leading-tight mb-1">{sub.subjects}</div>
                      )}
                      {sub.location_name && (
                        <div className="text-[13px] tracking-[0.04em] text-white/80">{sub.location_name}</div>
                      )}
                    </div>
                  </Link>
                  {sub.instagram_handle && (
                    <a
                      href={`https://instagram.com/${sub.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="absolute bottom-2 left-2 text-[9px] text-white/55 hover:text-white transition-colors opacity-0 group-hover:opacity-100 mt-1"
                    >
                      @{sub.instagram_handle}
                    </a>
                  )}
                  <button
                    onClick={(e) => toggleFavorite(e, sub.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    title={isFav ? 'Remove from saved' : 'Save'}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={isFav ? '#1A1814' : 'none'} stroke="#1A1814" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-cormorant italic text-[22px] font-light text-mthr-mid">no images here yet.</p>
            <Link href="/submit" className="inline-block mt-4 text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              be the first to submit →
            </Link>
          </div>
        )}
      </div>

      {/* FEATURED PHOTOGRAPHERS */}
      {photographers.length > 0 && (
        <div className="px-4 md:px-8 py-8 border-t border-[#E8E4DE]">
          <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-6">featured photographers</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {photographers.map((p, i) => (
              <Link key={p.id} href={`/photographer/${p.username || p.id}`} className="bg-white border border-[#E8E4DE] p-5 hover:border-mthr-mid transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#E8E4DE] flex items-center justify-center">
                    {p.avatar_url ? (
                      <Image src={p.avatar_url} alt={p.full_name ?? ''} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-[12px] font-medium text-mthr-mid">
                        {(p.full_name ?? 'M').split(' ').map(n => n[0]).join('').slice(0,2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-cormorant text-[17px] font-light text-mthr-black leading-none">{p.full_name}</p>
                    {p.location && <p className="text-[10px] text-mthr-mid mt-0.5">{p.location}</p>}
                  </div>
                </div>
                {p.instagram && (
                  <p className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid">@{p.instagram}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
