'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the token in the URL hash — we need to let it process
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  const handleUpdate = async () => {
    if (password !== confirm) { setError('passwords do not match'); return }
    if (password.length < 6) { setError('password must be at least 6 characters'); return }
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/login?reset=success')
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <Link href="/explore" className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black block mb-8">MTHR</Link>
          <p className="text-[12px] text-mthr-mid">verifying your reset link…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <Link href="/explore" className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black block mb-8">MTHR</Link>
        <h1 className="font-cormorant font-light text-[36px] leading-none text-mthr-black mb-1">new <em>password.</em></h1>
        <p className="text-[11px] text-mthr-mid mt-1.5 mb-8">choose a new password for your account.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">New password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Confirm password</label>
            <input type="password" placeholder="••••••••" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUpdate()}
              className="w-full px-3 py-2.5 bg-white border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
          </div>
        </div>

        {error && <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}

        <button onClick={handleUpdate} disabled={loading || !password || !confirm}
          className="w-full mt-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
          {loading ? 'updating…' : 'update password →'}
        </button>
      </div>
    </div>
  )
}
