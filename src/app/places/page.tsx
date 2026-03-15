import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 300

export default async function PlacesPage() {
  const supabase = createClient()

  const { data: places } = await supabase
    .from('places')
    .select('*')
    .order('session_count', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">

        {/* HERO */}
        <section className="relative h-[260px] overflow-hidden photo-warm-2">
          <div className="absolute inset-0 bg-black/35 flex flex-col justify-end px-9 pb-7">
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/60 font-medium mb-1.5">
              Locations · Worldwide
            </p>
            <h1 className="font-cormorant font-light text-[48px] leading-[0.95] text-white">
              Beautiful<br /><em>places.</em>
            </h1>
          </div>
        </section>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] mt-[2px]">
          {(places ?? PLACEHOLDER_PLACES).map((place) => (
            <div
              key={place.id ?? place.name}
              className="relative h-[180px] overflow-hidden cursor-pointer group photo-warm-1"
            >
              {place.cover_image && (
                <Image src={place.cover_image} alt={place.name} fill className="object-cover" />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[9px] tracking-[0.16em] uppercase text-white font-medium">Explore →</span>
              </div>
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-3 pt-5 pb-2.5">
                <div className="font-bebas text-[15px] tracking-[0.06em] text-white">{place.name}</div>
                <div className="font-cormorant italic text-[11px] font-light text-white/70">{place.country}</div>
                <div className="text-[8px] tracking-[0.1em] uppercase text-white/55 mt-0.5">{place.session_count} sessions</div>
              </div>
            </div>
          ))}
        </div>

        {/* SHARE CTA */}
        <section className="bg-mthr-white px-7 py-9">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-cormorant font-light text-[28px]">Share your <em>location</em></h2>
            <Link href="/submit" className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              Submit work →
            </Link>
          </div>
          <p className="text-[12px] text-mthr-mid leading-[1.8] max-w-lg">
            Know a beautiful place that deserves to be on MTHR? Share your session location and help other photographers discover the world's most photogenic places for families.
          </p>
        </section>

      </main>
      <Footer />
    </div>
  )
}

// Shown before any real data
const PLACEHOLDER_PLACES = [
  { id: '1', name: 'Tuscany', country: 'Italy', session_count: 48, cover_image: null },
  { id: '2', name: 'Algarve', country: 'Portugal', session_count: 34, cover_image: null },
  { id: '3', name: 'Kyoto', country: 'Japan', session_count: 27, cover_image: null },
  { id: '4', name: 'Oaxaca', country: 'Mexico', session_count: 21, cover_image: null },
  { id: '5', name: 'Cape Town', country: 'South Africa', session_count: 19, cover_image: null },
  { id: '6', name: 'Bali', country: 'Indonesia', session_count: 31, cover_image: null },
  { id: '7', name: 'Provence', country: 'France', session_count: 16, cover_image: null },
  { id: '8', name: 'Aspen', country: 'USA', session_count: 23, cover_image: null },
]
