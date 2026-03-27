'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/explore',        label: 'Explore' },
  { href: '/submit',         label: 'Submit' },
  { href: '/magazine',       label: 'Magazine' },
  { href: '/community',      label: 'Community' },
  { href: '/location-guide', label: 'Locations' },
]

export default function TopNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-[56px] px-8 bg-[#F5F2EE] border-b border-[#E8E4DE]">
      {/* Logo — thin serif caps matching reference */}
      <Link
        href="/explore"
        className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black hover:opacity-60 transition-opacity"
        style={{ letterSpacing: '0.25em' }}
      >
        MTHR
      </Link>

      {/* Center nav */}
      <div className="flex items-center gap-7">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`text-[10px] tracking-[0.16em] uppercase font-medium transition-colors ${
                active ? 'text-mthr-black' : 'text-mthr-mid hover:text-mthr-black'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Auth */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/inspo" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              Saved
            </Link>
            <button
              onClick={handleSignOut}
              className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-[10px] tracking-[0.14em] uppercase font-medium px-4 py-2 border border-mthr-black text-mthr-black hover:bg-mthr-black hover:text-white transition-colors rounded-sm"
            >
              Join
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
