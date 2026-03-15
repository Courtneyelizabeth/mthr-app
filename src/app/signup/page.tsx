'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async () => {
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })

    if (error) { setError(error.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mthr-white px-8">
        <div className="text-center max-w-sm">
          <Link href="/explore" className="font-bebas text-[22px] tracking-[0.1em] text-mthr-black block mb-8">MTHR</Link>
          <h1 className="font-cormorant font-light text-[36px] leading-[1] text-mthr-black mb-3">
            Check your<br /><em>email.</em>
          </h1>
          <p className="text-[12px] text-mthr-mid leading-[1.8]">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="inline-block mt-6 text-[9px] tracking-[0.16em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
            Back to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:block w-1/2 photo-bw-1 relative">
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-12">
          <Link href="/explore" className="font-bebas text-[32px] tracking-[0.1em] text-white">MTHR</Link>
          <p className="font-cormorant italic font-light text-[18px] text-white/75 mt-3">
            Join the community
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 bg-mthr-white">
        <div className="w-full max-w-sm">
          <h1 className="font-cormorant font-light text-[36px] leading-[1] text-mthr-black mb-1">
            Join<br /><em>MTHR.</em>
          </h1>
          <p className="text-[11px] text-mthr-mid mt-1.5 mb-8">
            Create your photographer profile and start submitting work.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
              />
            </div>
            <div>
              <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
              />
            </div>
            <div>
              <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>
          )}

          <button
            onClick={handleSignup}
            disabled={loading || !form.full_name || !form.email || !form.password}
            className="w-full mt-6 py-3 bg-mthr-black text-mthr-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create account →'}
          </button>

          <p className="mt-6 text-center text-[11px] text-mthr-mid">
            Already have an account?{' '}
            <Link href="/login" className="text-mthr-black underline underline-offset-2 hover:opacity-70 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
