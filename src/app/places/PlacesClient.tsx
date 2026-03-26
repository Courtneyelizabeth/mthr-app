'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Submission = {
  id: string
  title: string
  location_name: string
  location_state: string | null
  location_state_code: string | null
  location_country: string
  cover_image: string | null
  category: string
  created_at: string
  profiles: { full_name: string | null; username: string | null } | null
}

const PHOTO_CLASSES = ['photo-warm-1','photo-warm-2','photo-warm-3','photo-bw-1','photo-bw-2']

// Placeholder data shown before real submissions exist
const PLACEHOLDER_LOCATIONS = [
  { id:'p1', name:'Aspen', state:'CO', count:23 },
  { id:'p2', name:'Denver', state:'CO', count:14 },
  { id:'p3', name:'Telluride', state:'CO', count:8 },
  { id:'p4', name:'Brooklyn', state:'NY', count:31 },
  { id:'p5', name:'The Hamptons', state:'NY', count:18 },
  { id:'p6', name:'Malibu', state:'CA', count:27 },
  { id:'p7', name:'Napa Valley', state:'CA', count:21 },
  { id:'p8', name:'Nashville', state:'TN', count:16 },
]

export default function PlacesClient({ submissions }: { submissions: Submission[] }) {
  const [activeState, setActiveState] = useState<string>('All')

  // Group submissions by state code
  const stateGroups = useMemo(() => {
    const groups: Record<string, Submission[]> = {}
    for (const sub of submissions) {
      const code = sub.location_state_code ?? 'International'
      if (!groups[code]) groups[code] = []
      groups[code].push(sub)
    }
    return groups
  }, [submissions])

  // Get sorted list of state tabs
  const stateTabs = useMemo(() => {
    const codes = Object.keys(stateGroups).sort()
    return ['All', ...codes]
  }, [stateGroups])

  // Filter submissions by active state
  const filtered = useMemo(() => {
    if (activeState === 'All') return submissions
    return submissions.filter(s => (s.location_state_code ?? 'International') === activeState)
  }, [submissions, activeState])

  // Group filtered by location name for the grid
  const locationGroups = useMemo(() => {
    const groups: Record<string, Submission[]> = {}
    for (const sub of filtered) {
      const key = sub.location_name
      if (!groups[key]) groups[key] = []
      groups[key].push(sub)
    }
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  const hasRealData = submissions.length > 0

  return (
    <>
      {/* HERO */}
      <section className="relative h-[260px] overflow-hidden photo-warm-2">
        <div className="absolute inset-0 bg-black/35 flex flex-col justify-end px-9 pb-7">
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/60 font-medium mb-1.5">
            Locations · United States & Beyond
          </p>
          <h1 className="font-cormorant font-light text-[48px] leading-[0.95] text-white">
            Beautiful<br /><em>places.</em>
          </h1>
        </div>
      </section>

      {/* STATE TABS */}
      {hasRealData && stateTabs.length > 1 && (
        <div className="bg-mthr-white border-b border-mthr-b1 sticky top-[52px] z-40">
          <div className="flex overflow-x-auto scrollbar-none px-7 gap-1 py-2">
            {stateTabs.map(state => (
              <button
                key={state}
                onClick={() => setActiveState(state)}
                className={`flex-shrink-0 px-4 py-2 text-[9px] tracking-[0.14em] uppercase font-medium rounded-sm transition-colors ${
                  activeState === state
                    ? 'bg-mthr-black text-mthr-white'
                    : 'text-mthr-mid hover:text-mthr-black hover:bg-mthr-off'
                }`}
              >
                {state}
                {state !== 'All' && (
                  <span className="ml-1.5 opacity-60">
                    {stateGroups[state]?.length ?? 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LOCATIONS GRID */}
      {hasRealData ? (
        <div className="bg-mthr-off">
          {locationGroups.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] mt-[2px]">
              {locationGroups.map(([locationName, subs], i) => (
                <div key={locationName} className={`relative h-[200px] overflow-hidden group cursor-pointer ${PHOTO_CLASSES[i % PHOTO_CLASSES.length]}`}>
                  {subs[0]?.cover_image && (
                    <Image src={subs[0].cover_image} alt={locationName} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] tracking-[0.16em] uppercase text-white font-medium">
                      {subs.length} session{subs.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-3 pt-5 pb-2.5">
                    <div className="font-bebas text-[16px] tracking-[0.06em] text-white leading-none">
                      {locationName.split(',')[0].toUpperCase()}
                    </div>
                    <div className="font-cormorant italic text-[11px] font-light text-white/70 mt-0.5">
                      {locationName}
                    </div>
                    <div className="text-[8px] tracking-[0.1em] uppercase text-white/55 mt-0.5">
                      {subs.length} session{subs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-cormorant italic text-[20px] font-light text-mthr-mid">
                No sessions in {activeState} yet.
              </p>
              <Link href="/submit" className="inline-block mt-4 text-[9px] tracking-[0.16em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                Be the first to submit →
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Placeholder before real data */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] mt-[2px]">
          {PLACEHOLDER_LOCATIONS.map((p, i) => (
            <div key={p.id} className={`relative h-[200px] overflow-hidden group cursor-pointer ${PHOTO_CLASSES[i % PHOTO_CLASSES.length]}`}>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[9px] tracking-[0.16em] uppercase text-white font-medium">Coming soon</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-3 pt-5 pb-2.5">
                <div className="font-bebas text-[16px] tracking-[0.06em] text-white leading-none">{p.name.toUpperCase()}</div>
                <div className="font-cormorant italic text-[11px] font-light text-white/70 mt-0.5">{p.name}, {p.state}</div>
                <div className="text-[8px] tracking-[0.1em] uppercase text-white/55 mt-0.5">{p.count} sessions</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <section className="bg-mthr-white px-7 py-9 border-t border-mthr-b1">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-cormorant font-light text-[28px]">Share your <em>location</em></h2>
          <Link href="/submit" className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
            Submit work →
          </Link>
        </div>
        <p className="text-[12px] text-mthr-mid leading-[1.8] max-w-lg">
          Tag your session location when submitting work — it automatically appears under the right state tab, helping photographers and clients discover beautiful places near them.
        </p>
      </section>
    </>
  )
}
