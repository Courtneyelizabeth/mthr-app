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
    <div className="min-h-screen bg-[#F5F2EE] flex">
      <div className="hidden md:flex w-1/2 relative items-end p-12 overflow-hidden">
        {/* Warm editorial photo placeholder — replace src with real image */}
        <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/login-hero.jpg" alt="MTHR" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative z-10">
          <Link href="/explore" className="font-cormorant font-light text-[28px] tracking-[0.25em] uppercase text-white block mb-2">
            MTHR
          </Link>
          <p className="font-cormorant italic font-light text-[18px] text-white/75">
            where real life is the story.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <Link href="/explore" className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black md:hidden block mb-8">
            MTHR
          </Link>
          <h1 className="font-cormorant font-light text-[36px] leading-none text-mthr-black mb-1">
            welcome <em>back.</em>
          </h1>
          <p className="text-[11px] text-mthr-mid mt-1.5 mb-8">sign in to submit work and manage your profile.</p>

          <div className="space-y-4">
            <Field label="Email">
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 bg-white border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
            </Field>
            <Field label="Password">
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 bg-white border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
            </Field>
          </div>

          {error && <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}

          <button onClick={handleLogin} disabled={loading || !email || !password}
            className="w-full mt-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
            {loading ? 'signing in…' : 'sign in →'}
          </button>

          <p className="mt-4 text-center text-[11px] text-mthr-mid">
            <Link href="/forgot-password" className="text-mthr-mid hover:text-mthr-black transition-colors underline underline-offset-2">
              forgot your password?
            </Link>
          </p>
          <p className="mt-3 text-center text-[11px] text-mthr-mid">
            no account yet?{' '}
            <Link href="/signup" className="text-mthr-black underline underline-offset-2 hover:opacity-70 transition-opacity">
              join MTHR
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F2EE]" />}>
      <LoginForm />
    </Suspense>
  )
}
