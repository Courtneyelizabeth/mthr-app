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
  { value: 'all',        label: 'All' },
  { value: 'motherhood', label: 'Motherhood' },
  { value: 'family_documentary', label: 'Family' },
  { value: 'editorial',  label: 'Maternity' },
  { value: 'kids',       label: 'Kids' },
  { value: 'other',      label: 'Other' },
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
        // Load existing favorites
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
      await (supabase.from('favorites') as any).delete()
        .eq('user_id', userId).eq('submission_id', submissionId)
      setFavorites(prev => { const n = new Set(prev); n.delete(submissionId); return n })
    } else {
      await (supabase.from('favorites') as any).insert({ user_id: userId, submission_id: submissionId })
      setFavorites(prev => new Set(Array.from(prev).concat(submissionId)))
    }
  }

  const quarterFeatured = submissions.filter(s => s.quarter_featured)

  const filtered = submissions
    .filter(s => activeCategory === 'all' || s.category === activeCategory)
    .filter(s => activeState === 'all' || s.location_state === activeState)

  return (
    <div>
      {/* Page header */}
      <div className="px-8 pt-10 pb-6 border-b border-[#E8E4DE]">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black">
              featured <em>this week.</em>
            </h1>
            <p className="text-[11px] text-mthr-mid mt-2 tracking-[0.06em]">
              {submissions.length} image{submissions.length !== 1 ? 's' : ''} · updated weekly
            </p>
          </div>
          <Link
            href="/submit"
            className="text-[10px] tracking-[0.16em] uppercase text-mthr-mid hover:text-mthr-black transition-colors border-b border-mthr-mid hover:border-mthr-black"
          >
            Submit your work →
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mt-6 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-1.5 text-[9.5px] tracking-[0.14em] uppercase font-medium rounded-full transition-colors border ${
                activeCategory === cat.value
                  ? 'bg-mthr-black text-white border-mthr-black'
                  : 'bg-transparent text-mthr-mid border-mthr-b2 hover:border-mthr-mid hover:text-mthr-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* State/location filter */}
        {states.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap">
            <button
              onClick={() => setActiveState('all')}
              className={`px-3 py-1 text-[9px] tracking-[0.12em] uppercase font-medium rounded-full transition-colors border ${
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
                className={`px-3 py-1 text-[9px] tracking-[0.12em] uppercase font-medium rounded-full transition-colors border ${
                  activeState === state
                    ? 'bg-mthr-black text-white border-mthr-black'
                    : 'bg-transparent text-mthr-mid border-mthr-b2 hover:border-mthr-mid hover:text-mthr-black'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quarter featured */}
      {quarterFeatured.length > 0 && activeCategory === 'all' && activeState === 'all' && (
        <div className="px-8 pt-6 pb-2">
          <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-4">featured this quarter</p>
          <div className="columns-2 md:columns-4 gap-3 space-y-3">
            {quarterFeatured.map((sub) => {
              const img = sub.cover_image ?? sub.images?.[0] ?? null
              if (!img) return null
              return (
                <div key={sub.id} className="relative break-inside-avoid group">
                  <Link href={`/submission/${sub.id}`}>
                    <Image src={img} alt={sub.subjects ?? sub.title} width={600} height={900}
                      className="w-full h-auto object-cover rounded-sm" style={{ display: 'block' }} />
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
          <div className="border-t border-[#E8E4DE] mt-6 mb-0" />
        </div>
      )}

      {/* Photo grid */}
      <div className="px-8 py-6">
        {filtered.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {filtered.map((sub) => {
              const img = sub.cover_image ?? sub.images?.[0] ?? null
              if (!img) return null
              const isFav = favorites.has(sub.id)
              return (
                <div key={sub.id} className="relative break-inside-avoid group">
                  <Link href={`/submission/${sub.id}`}>
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
                        <div className="font-cormorant italic text-[14px] font-light text-white leading-none">
                          {sub.subjects}
                        </div>
                      )}
                      <div className="text-[10px] tracking-[0.08em] text-white/70 mt-0.5">
                        {sub.location_name}
                      </div>
                      {sub.instagram_handle && (
                        <a
                          href={`https://instagram.com/${sub.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[9px] tracking-[0.08em] text-white/55 hover:text-white transition-colors mt-0.5"
                        >
                          @{sub.instagram_handle}
                        </a>
                      )}
                    </div>
                  </Link>
                  {/* Favorite button */}
                  <button
                    onClick={(e) => toggleFavorite(e, sub.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    title={isFav ? 'Remove from saved' : 'Save to inspo'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? '#1A1814' : 'none'} stroke="#1A1814" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-cormorant italic text-[22px] font-light text-mthr-mid">
              No images in this category yet.
            </p>
            <Link href="/submit" className="inline-block mt-4 text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              Be the first to submit →
            </Link>
          </div>
        )}
      </div>

      {/* Featured photographers */}
      {photographers.length > 0 && (
        <div className="px-8 py-8 border-t border-[#E8E4DE]">
          <h2 className="font-cormorant font-light text-[28px] text-mthr-black mb-6">
            featured <em>photographers.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {photographers.map((p, i) => (
              <div key={p.id} className="bg-white rounded-sm p-5 border border-[#E8E4DE]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 photo-warm-1">
                    {p.avatar_url && (
                      <Image src={p.avatar_url} alt={p.full_name ?? ''} width={48} height={48} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[0.1em] uppercase text-mthr-dim mb-0.5">
                      {String(i + 1).padStart(2, '0')}.
                    </div>
                    <Link
                      href={`/photographer/${p.username || p.id}`}
                      className="font-cormorant text-[17px] font-light text-mthr-black hover:opacity-60 transition-opacity block leading-none"
                    >
                      {p.full_name}
                    </Link>
                    {p.location && (
                      <div className="text-[10px] text-mthr-mid mt-0.5">{p.location}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.instagram && (
                    <a
                      href={`https://instagram.com/${p.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid hover:text-mthr-black transition-colors"
                    >
                      @{p.instagram}
                    </a>
                  )}
                  <Link
                    href={`/photographer/${p.username || p.id}`}
                    className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid hover:text-mthr-black transition-colors ml-auto"
                  >
                    View work →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
