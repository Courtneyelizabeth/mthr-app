'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  const [menuOpen, setMenuOpen] = useState(false)
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
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F2EE] border-b border-[#E8E4DE]">
      <div className="flex items-center justify-between h-[56px] px-6 md:px-8">

        {/* Logo */}
        <Link
          href="/explore"
          className="hover:opacity-60 transition-opacity flex-shrink-0"
        >
          <img src="/mthr-logo.svg" alt="MTHR" className="h-7 w-auto" style={{filter: 'brightness(0)'}} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
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

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/inspo" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                Saved
              </Link>
              <Link href="/account" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                Account
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="text-[10px] tracking-[0.14em] uppercase font-medium px-4 py-2 border border-mthr-black text-mthr-black hover:bg-mthr-black hover:text-white transition-colors rounded-sm">
                Join
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-[5px] p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-mthr-black transition-all ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-mthr-black transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-mthr-black transition-all ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F5F2EE] border-t border-[#E8E4DE] px-6 py-4 flex flex-col gap-0">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`py-3 text-[11px] tracking-[0.16em] uppercase font-medium border-b border-[#E8E4DE] transition-colors ${
                  active ? 'text-mthr-black' : 'text-mthr-mid'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <div className="flex gap-4 pt-4">
            {user ? (
              <>
                <Link href="/inspo" onClick={() => setMenuOpen(false)} className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid">
                  Saved
                </Link>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid">
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid">
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="text-[10px] tracking-[0.14em] uppercase font-medium px-4 py-2 border border-mthr-black text-mthr-black rounded-sm">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
