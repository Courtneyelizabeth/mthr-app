'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/explore',  label: 'Explore' },
  { href: '/places',   label: 'Places' },
  { href: '/magazine', label: 'Magazine' },
  { href: '/submit',   label: 'Submit work' },
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
    <nav className="sticky top-0 z-50 flex items-center justify-between h-[52px] px-7 bg-mthr-white border-b border-mthr-b1">
      {/* Logo */}
      <Link href="/explore" className="font-bebas text-[22px] tracking-[0.1em] text-mthr-black hover:opacity-70 transition-opacity">
        MTHR
      </Link>

      {/* Center nav links */}
      <div className="flex items-center gap-6">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`text-[9.5px] tracking-[0.14em] uppercase font-medium pb-0.5 border-b transition-colors ${
                active
                  ? 'text-mthr-black border-mthr-black'
                  : 'text-mthr-mid border-transparent hover:text-mthr-black hover:border-mthr-b2'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/photographer" className="btn-ghost py-1.5 px-3">
              Profile
            </Link>
            <button onClick={handleSignOut} className="btn-ghost py-1.5 px-3">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost py-1.5 px-3">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary py-1.5 px-3">
              Join MTHR
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
