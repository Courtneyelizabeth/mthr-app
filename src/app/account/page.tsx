'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Under review', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  approved: { label: 'Live',         color: 'text-green-700 bg-green-50 border-green-200' },
  featured: { label: 'Featured',     color: 'text-mthr-black bg-white border-mthr-black' },
  rejected: { label: 'Not selected', color: 'text-mthr-mid bg-[#F5F2EE] border-[#D0CCC6]' },
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const avatarRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'submissions' | 'account'>('profile')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    instagram: '',
    location: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/account'); return }
      setUser(user)

      const { data: prof } = await (supabase.from('profiles') as any).select('*').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setForm({
          full_name: prof.full_name ?? '',
          username: prof.username ?? '',
          bio: prof.bio ?? '',
          instagram: prof.instagram ?? '',
          location: prof.location ?? '',
        })
      }

      const { data: subs } = await supabase
        .from('submissions')
        .select('id, title, category, status, cover_image, location_name, created_at, submission_type')
        .eq('photographer_id', user.id)
        .order('created_at', { ascending: false })
      setSubmissions(subs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const { error } = await (supabase.from('profiles') as any).update({
      full_name: form.full_name,
      username: form.username,
      bio: form.bio,
      instagram: form.instagram.replace('@', ''),
      location: form.location,
    }).eq('id', user.id)
    if (error) { setError(error.message) }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const path = `avatars/${user.id}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('submissions').upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); return }
    const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
    await (supabase.from('profiles') as any).update({ avatar_url: publicUrl }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, avatar_url: publicUrl }))
  }

  const handleDeleteSubmission = async (id: string) => {
    await supabase.from('submissions').delete().eq('id', id)
    setSubmissions(s => s.filter(sub => sub.id !== id))
    setDeleteConfirm(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/account` })
    alert('Password reset email sent — check your inbox.')
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[12px] text-mthr-mid">loading...</p>
      </main>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* Header */}
        <div className="px-8 pt-10 pb-6 border-b border-[#E8E4DE] bg-white">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#E8E4DE] flex-shrink-0">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[18px] text-mthr-mid font-cormorant">
                    {form.full_name?.[0] ?? '?'}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[9px] tracking-[0.1em] uppercase">edit</span>
              </div>
              <input ref={avatarRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <div className="mb-6">
          <Link href={`/photographer/${profile?.id}`}
            className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors border-b border-[#D0CCC6] hover:border-mthr-black pb-px">
            view your public profile →
          </Link>
        </div>
        <h1 className="font-cormorant font-light text-[32px] leading-none text-mthr-black">
                {form.full_name || 'your account.'}
              </h1>
              <p className="text-[11px] text-mthr-mid mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-6 border-b border-[#E8E4DE] -mb-px">
            {(['profile', 'submissions', 'account'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab ? 'border-mthr-black text-mthr-black' : 'border-transparent text-mthr-mid hover:text-mthr-black'
                }`}>
                {tab === 'submissions' ? `submissions (${submissions.length})` : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl px-8 py-10">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <Field label="Full name">
                <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="mthr-field" />
              </Field>
              <Field label="Username">
                <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="mthr-field" />
              </Field>
              <Field label="Instagram handle">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-mthr-mid">@</span>
                  <input type="text" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value.replace('@','') }))}
                    className="mthr-field pl-7" />
                </div>
              </Field>
              <Field label="Location">
                <input type="text" placeholder="Denver, CO" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="mthr-field" />
              </Field>
              <Field label="Bio (optional)">
                <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="mthr-field resize-none leading-relaxed" />
              </Field>

              {error && <p className="text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}
              {saved && <p className="text-[11px] text-green-700 bg-green-50 px-3 py-2 rounded-sm">profile saved.</p>}

              <button onClick={handleSave} disabled={saving}
                className="px-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.16em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
                {saving ? 'saving…' : 'save profile →'}
              </button>

              {profile?.username && (
                <p className="text-[10px] text-mthr-mid">
                  your public profile: <Link href={`/photographer/${profile.username}`} className="underline hover:text-mthr-black">mthrmag.com/photographer/{profile.username}</Link>
                </p>
              )}
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === 'submissions' && (
            <div>
              {submissions.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-cormorant italic text-[20px] font-light text-mthr-mid mb-4">no submissions yet.</p>
                  <Link href="/submit" className="text-[10px] tracking-[0.14em] uppercase font-medium text-mthr-black border-b border-mthr-black hover:opacity-60 transition-opacity">
                    submit your first image →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E8E4DE]">
                  {submissions.map(sub => {
                    const status = STATUS_LABELS[sub.status] ?? STATUS_LABELS.pending
                    return (
                      <div key={sub.id} className="py-4 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-sm overflow-hidden flex-shrink-0 bg-[#E8E4DE]">
                          {sub.cover_image && (
                            <Image src={sub.cover_image} alt="" width={56} height={56} className="object-cover w-full h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-mthr-black font-medium truncate">{sub.title || sub.location_name || 'Untitled'}</p>
                          <p className="text-[10px] text-mthr-mid mt-0.5">{sub.location_name} · {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                          <span className={`inline-block mt-1 text-[8px] tracking-[0.1em] uppercase font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {sub.status === 'approved' || sub.status === 'featured' ? (
                            <Link href={`/submission/${sub.id}`} className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
                              view →
                            </Link>
                          ) : null}
                          {deleteConfirm === sub.id ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleDeleteSubmission(sub.id)}
                                className="text-[9px] tracking-[0.1em] uppercase text-red-600 hover:text-red-800 transition-colors">confirm delete</button>
                              <button onClick={() => setDeleteConfirm(null)}
                                className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(sub.id)}
                              className="text-[9px] tracking-[0.1em] uppercase text-mthr-dim hover:text-red-600 transition-colors">delete</button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="border border-[#E8E4DE] rounded-sm divide-y divide-[#E8E4DE]">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-mthr-black font-medium">password</p>
                    <p className="text-[11px] text-mthr-mid mt-0.5">send a reset link to {user?.email}</p>
                  </div>
                  <button onClick={handlePasswordReset}
                    className="text-[9px] tracking-[0.14em] uppercase font-medium text-mthr-black border border-mthr-black px-3 py-1.5 rounded-sm hover:bg-mthr-black hover:text-white transition-colors">
                    reset →
                  </button>
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-mthr-black font-medium">sign out</p>
                    <p className="text-[11px] text-mthr-mid mt-0.5">sign out of your MTHR account</p>
                  </div>
                  <button onClick={handleSignOut}
                    className="text-[9px] tracking-[0.14em] uppercase font-medium text-mthr-mid border border-[#D0CCC6] px-3 py-1.5 rounded-sm hover:border-mthr-black hover:text-mthr-black transition-colors">
                    sign out
                  </button>
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-mthr-black font-medium">delete account</p>
                    <p className="text-[11px] text-mthr-mid mt-0.5">request permanent deletion of your account and data</p>
                  </div>
                  <a href={`mailto:hello@mthrmag.com?subject=Account deletion request&body=Please delete my account. Email: ${user?.email}`}
                    className="text-[9px] tracking-[0.14em] uppercase font-medium text-red-600 border border-red-200 px-3 py-1.5 rounded-sm hover:bg-red-50 transition-colors">
                    request →
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
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
