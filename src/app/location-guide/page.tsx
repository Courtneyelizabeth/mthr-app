'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Submission = {
  id: string
  title: string
  cover_image: string | null
  images: string[]
  subjects: string | null
  location_name: string
  location_country: string
  location_state: string | null
  location_state_code: string | null
  instagram_handle: string | null
  category: string
  created_at: string
  profiles: { full_name: string | null; username: string | null; instagram: string | null } | null
}

export default function LocationGuideClient({ submissions }: { submissions: Submission[] }) {
  const [activeState, setActiveState] = useState('All')

  const stateTabs = useMemo(() => {
    const codes = [...new Set(submissions.map(s => s.location_state_code ?? 'Intl'))].sort()
    return ['All', ...codes]
  }, [submissions])

  const filtered = useMemo(() => {
    if (activeState === 'All') return submissions
    return submissions.filter(s => (s.location_state_code ?? 'Intl') === activeState)
  }, [submissions, activeState])

  // Group by location name
  const locationGroups = useMemo(() => {
    const groups: Record<string, Submission[]> = {}
    for (const sub of filtered) {
      if (!groups[sub.location_name]) groups[sub.location_name] = []
      groups[sub.location_name].push(sub)
    }
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-10 pb-6 border-b border-[#E8E4DE]">
        <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black">
          location <em>guide.</em>
        </h1>
        <p className="text-[11px] text-mthr-mid mt-2">
          discover beautiful places to shoot, shared by the community.
        </p>
      </div>

      {/* State tabs */}
      {stateTabs.length > 1 && (
        <div className="bg-[#F5F2EE] border-b border-[#E8E4DE] px-8 py-3 flex gap-1 flex-wrap">
          {stateTabs.map(state => (
            <button
              key={state}
              onClick={() => setActiveState(state)}
              className={`px-3 py-1.5 text-[9.5px] tracking-[0.12em] uppercase font-medium rounded-full transition-colors border ${
                activeState === state
                  ? 'bg-mthr-black text-white border-mthr-black'
                  : 'bg-transparent text-mthr-mid border-mthr-b2 hover:border-mthr-mid hover:text-mthr-black'
              }`}
            >
              {state}
              {state !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  {submissions.filter(s => (s.location_state_code ?? 'Intl') === state).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Locations grid */}
      <div className="px-8 py-8">
        {locationGroups.length > 0 ? (
          <div className="space-y-10">
            {locationGroups.map(([locationName, subs]) => (
              <div key={locationName}>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <h2 className="font-cormorant text-[26px] font-light text-mthr-black">
                      {locationName.split(',')[0]}
                    </h2>
                    <p className="text-[10px] tracking-[0.1em] text-mthr-mid">{locationName}</p>
                  </div>
                  <span className="text-[10px] tracking-[0.1em] text-mthr-dim">
                    {subs.length} session{subs.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {subs.slice(0, 8).map(sub => {
                    const img = sub.cover_image ?? sub.images?.[0] ?? null
                    return (
                      <Link
                        key={sub.id}
                        href={`/submission/${sub.id}`}
                        className="relative aspect-square overflow-hidden group rounded-sm photo-warm-1"
                      >
                        {img && (
                          <Image src={img} alt={sub.subjects ?? sub.title} fill className="object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col justify-end p-2.5">
                          {sub.subjects && (
                            <div className="font-cormorant italic text-[12px] font-light text-white">{sub.subjects}</div>
                          )}
                          {sub.instagram_handle && (
                            <div className="text-[9px] text-white/60">@{sub.instagram_handle}</div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-cormorant italic text-[20px] font-light text-mthr-mid">
              no locations in {activeState} yet.
            </p>
            <Link href="/submit" className="inline-block mt-4 text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              be the first to submit →
            </Link>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-8 py-8 border-t border-[#E8E4DE]">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-cormorant font-light text-[24px] text-mthr-black">share your <em>location.</em></h2>
          <Link href="/submit" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
            Submit work →
          </Link>
        </div>
        <p className="text-[12px] text-mthr-mid leading-[1.8] max-w-lg">
          tag your session location when submitting — it automatically appears here, helping photographers discover beautiful places near them.
        </p>
      </div>
    </div>
  )
}
