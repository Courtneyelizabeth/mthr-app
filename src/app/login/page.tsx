'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') ?? '/explore'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden md:block w-1/2 photo-warm-1 relative">
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-12">
          <Link href="/explore" className="font-bebas text-[32px] tracking-[0.1em] text-white">MTHR</Link>
          <p className="font-cormorant italic font-light text-[18px] text-white/75 mt-3">
            Documentary honest imagery
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 bg-mthr-white">
        <div className="w-full max-w-sm">
          <Link href="/explore" className="font-bebas text-[22px] tracking-[0.1em] text-mthr-black md:hidden block mb-8">
            MTHR
          </Link>

          <h1 className="font-cormorant font-light text-[36px] leading-[1] text-mthr-black mb-1">
            Welcome<br /><em>back.</em>
          </h1>
          <p className="text-[11px] text-mthr-mid mt-1.5 mb-8">
            Sign in to submit work and manage your profile.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
              />
            </div>
            <div>
              <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full mt-6 py-3 bg-mthr-black text-mthr-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>

          <p className="mt-6 text-center text-[11px] text-mthr-mid">
            No account yet?{' '}
            <Link href="/signup" className="text-mthr-black underline underline-offset-2 hover:opacity-70 transition-opacity">
              Join MTHR
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mthr-white" />}>
      <LoginForm />
    </Suspense>
  )
}