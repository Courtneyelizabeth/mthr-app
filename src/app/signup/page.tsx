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
      <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <Link href="/explore" className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black block mb-8">MTHR</Link>
          <h1 className="font-cormorant font-light text-[36px] leading-none text-mthr-black mb-3">check your <em>email.</em></h1>
          <p className="text-[12px] text-mthr-mid leading-[1.8]">
            we sent a confirmation link to <strong>{form.email}</strong>. click it to activate your account.
          </p>
          <Link href="/login" className="inline-block mt-6 text-[9px] tracking-[0.16em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
            back to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2EE] flex">
      <div className="hidden md:flex w-1/2 relative items-end p-12 overflow-hidden">
        <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/katiemitzphoto-123.jpg" alt="MTHR" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative z-10">
          <Link href="/explore" className="font-cormorant font-light text-[28px] tracking-[0.25em] uppercase text-white block mb-2">MTHR</Link>
          <p className="font-cormorant italic font-light text-[18px] text-white/75">join the community.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-cormorant font-light text-[36px] leading-none text-mthr-black mb-1">join <em>MTHR.</em></h1>
          <p className="text-[11px] text-mthr-mid mt-1.5 mb-8">create your photographer profile and start submitting work.</p>

          <div className="space-y-4">
            {[
              { label: 'Full name', key: 'full_name', type: 'text', placeholder: 'Your name' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 8 characters' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}

          <button onClick={handleSignup} disabled={loading || !form.full_name || !form.email || !form.password}
            className="w-full mt-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
            {loading ? 'creating account…' : 'create account →'}
          </button>

          <p className="mt-6 text-center text-[11px] text-mthr-mid">
            already have an account?{' '}
            <Link href="/login" className="text-mthr-black underline underline-offset-2 hover:opacity-70 transition-opacity">sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
