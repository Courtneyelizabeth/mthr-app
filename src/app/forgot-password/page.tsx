'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <Link href="/explore" className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black block mb-8">MTHR</Link>
          <div className="w-16 h-[1px] bg-[#D0CCC6] mx-auto mb-8" />
          <h1 className="font-cormorant font-light text-[36px] leading-none text-mthr-black mb-3">check your <em>email.</em></h1>
          <p className="text-[12px] text-mthr-mid leading-[1.8] mb-3">
            we sent a password reset link to <strong>{email}</strong>.
          </p>
          <p className="text-[11px] text-mthr-mid leading-[1.8] px-4 py-3 bg-white border border-[#E8E4DE] rounded-sm mb-6">
            don't see it? check your <strong>junk or spam folder</strong>.
          </p>
          <Link href="/login" className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
            back to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <Link href="/explore" className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black block mb-8">MTHR</Link>
        <h1 className="font-cormorant font-light text-[36px] leading-none text-mthr-black mb-1">reset your <em>password.</em></h1>
        <p className="text-[11px] text-mthr-mid mt-1.5 mb-8">enter your email and we'll send you a reset link.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              className="w-full px-3 py-2.5 bg-white border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
          </div>
        </div>

        {error && <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}

        <button onClick={handleReset} disabled={loading || !email}
          className="w-full mt-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
          {loading ? 'sending…' : 'send reset link →'}
        </button>

        <p className="mt-6 text-center text-[11px] text-mthr-mid">
          <Link href="/login" className="text-mthr-mid hover:text-mthr-black transition-colors underline underline-offset-2">
            back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
