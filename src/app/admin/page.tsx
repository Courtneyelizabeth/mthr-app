'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mthr-admin-2026'

type Submission = {
  id: string; title: string; location_name: string; location_country: string
  category: string; status: string; submission_type: string; subjects: string | null
  instagram_handle: string | null; description: string | null
  cover_image: string | null; images: string[]; gallery_link: string | null; created_at: string; photographer_id: string; photographer_email: string | null
  photographer_id: string | null
  profiles: { full_name: string | null; username: string | null } | null
}

export default function AdminPage() {
  const supabase = createClient()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Check if already authed this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('mthr-admin') === 'true') {
      setAuthed(true)
    }
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('mthr-admin', 'true')
      setAuthed(true)
    } else {
      alert('Incorrect password')
    }
  }
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'featured' | 'rejected'>('pending')
  const [viewType, setViewType] = useState<'app' | 'magazine'>('app')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('submissions')
      .select(`id, title, location_name, location_country, category, status, submission_type, subjects, instagram_handle, description, cover_image, images, gallery_link, created_at, photographer_id, photographer_email, profiles:photographer_id (full_name, username)`)
      .eq('status', filter)
      .eq('submission_type', viewType)
      .order('created_at', { ascending: false })
    setSubmissions(data ?? [])
    setLoading(false)
  }

  useEffect(() => { if (authed) fetchSubmissions() }, [authed, filter, viewType])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await supabase.from('submissions').update({ status }).eq('id', id)

    // Send featured email
    if (status === 'featured') {
      const sub = submissions.find(s => s.id === id)
      if (sub) {
        try {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'featured',
              photographer_name: sub.profiles?.full_name ?? sub.instagram_handle ?? 'Photographer',
              photographer_email: sub.photographer_email ?? '',
              submission_title: sub.title ?? 'your image',
              instagram_handle: sub.instagram_handle ?? '',
              location: sub.location_name ?? '',
            }),
          })
        } catch (e) {
          console.error('Featured email error:', e)
        }
      }
    }

    setSubmissions(prev => prev.filter(s => s.id !== id))
    setUpdating(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center">
        <div className="bg-white rounded-sm p-10 w-full max-w-sm border border-[#E8E4DE]">
          <div className="font-cormorant font-light text-[22px] tracking-[0.25em] uppercase text-mthr-black mb-1">MTHR</div>
          <h1 className="font-cormorant font-light text-[28px] text-mthr-black mb-6">admin <em>access.</em></h1>
          <div className="mb-4">
            <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full px-3 py-2.5 border border-[#D0CCC6] text-[13px] rounded-sm outline-none focus:border-mthr-black transition-colors" />
          </div>
          <button onClick={handleLogin}
            className="w-full py-3 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors">
            sign in →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2EE]">
      <div className="bg-white border-b border-[#E8E4DE] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-cormorant font-light text-[20px] tracking-[0.25em] uppercase text-mthr-black">MTHR</span>
          <span className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid font-medium">Admin</span>
        </div>
        <Link href="/explore" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
          view site →
        </Link>
      </div>

      <div className="bg-white border-b border-[#E8E4DE] px-8 pt-3 flex gap-2">
        {(['app', 'magazine'] as const).map(t => (
          <button key={t} onClick={() => setViewType(t)}
            className={`px-4 py-1.5 mb-2 text-[9px] tracking-[0.14em] uppercase font-medium rounded-full border transition-colors ${
              viewType === t ? 'bg-mthr-black text-white border-mthr-black' : 'border-[#D0CCC6] text-mthr-mid hover:border-mthr-black hover:text-mthr-black'
            }`}>
            {t === 'app' ? 'App' : 'Magazine'}
          </button>
        ))}
      </div>
      <div className="bg-white border-b border-[#E8E4DE] px-8 flex gap-1">
        {(['pending', 'approved', 'featured', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors ${
              filter === s ? 'border-mthr-black text-mthr-black' : 'border-transparent text-mthr-mid hover:text-mthr-black'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="px-8 py-8">
        {loading ? (
          <p className="text-[12px] text-mthr-mid">loading...</p>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-cormorant italic text-[20px] font-light text-mthr-mid">no {filter} {viewType} submissions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div key={sub.id} className="bg-white border border-[#E8E4DE] rounded-sm overflow-hidden flex">
                <div className="w-[260px] flex-shrink-0">
                  {sub.submission_type === 'magazine' ? (
                    <div className="h-[180px] bg-[#F5F2EE] flex flex-col items-center justify-center gap-2">
                      <p className="text-[9px] tracking-[0.12em] uppercase text-mthr-mid font-medium">Gallery submission</p>
                      {(sub as any).gallery_link && (
                        <a href={(sub as any).gallery_link} target="_blank" rel="noopener noreferrer"
                          className="text-[9px] tracking-[0.1em] uppercase text-mthr-black border-b border-mthr-black hover:opacity-60 transition-opacity">
                          view gallery →
                        </a>
                      )}
                    </div>
                  ) : sub.cover_image ? (
                    <div className={`grid gap-[2px] h-[180px] ${sub.images?.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <div className="relative overflow-hidden photo-warm-1">
                        <Image src={sub.cover_image} alt={sub.title} fill className="object-cover" />
                      </div>
                      {sub.images?.slice(1, 4).map((img, i) => (
                        <div key={i} className="relative overflow-hidden photo-warm-1">
                          <Image src={img} alt={sub.title} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[180px] photo-warm-1" />
                  )}
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="font-cormorant text-[20px] font-light text-mthr-black">{sub.title}</h2>
                      <p className="font-cormorant italic text-[13px] font-light text-mthr-mid">{sub.location_name}, {sub.location_country}</p>
                    </div>
                    <span className="text-[8px] tracking-[0.1em] uppercase bg-[#E8E4DE] text-mthr-dark px-2 py-1 rounded-full font-medium">
                      {sub.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3 text-[11px] text-mthr-mid">
                    {sub.subjects && <span>people: <strong className="text-mthr-black">{sub.subjects}</strong></span>}
                    {sub.instagram_handle && <span>@{sub.instagram_handle}</span>}
                    <span>by: <strong className="text-mthr-black">{sub.profiles?.full_name ?? 'Unknown'}</strong></span>
                    <span>{sub.images?.length ?? 0} images</span>
                    <span>{new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {sub.description && <p className="text-[11px] text-mthr-mid leading-[1.7] mb-4 line-clamp-2">{sub.description}</p>}
                  <div className="flex gap-2">

                    {filter === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(sub.id, 'approved')} disabled={updating === sub.id}
                          className="px-4 py-2 bg-mthr-black text-white text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
                          {updating === sub.id ? '...' : 'Approve'}
                        </button>
                        <button onClick={() => updateStatus(sub.id, 'featured')} disabled={updating === sub.id}
                          className="px-4 py-2 border border-mthr-black text-mthr-black text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:bg-mthr-black hover:text-white transition-colors disabled:opacity-40">
                          Feature
                        </button>
                        <button onClick={() => updateStatus(sub.id, 'rejected')} disabled={updating === sub.id}
                          className="px-4 py-2 border border-[#D0CCC6] text-mthr-mid text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:text-mthr-black transition-colors disabled:opacity-40">
                          Reject
                        </button>
                      </>
                    )}
                    {filter === 'approved' && (
                      <>
                        <button onClick={() => updateStatus(sub.id, 'featured')} disabled={updating === sub.id}
                          className="px-4 py-2 bg-mthr-black text-white text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
                          Feature
                        </button>
                        <button onClick={() => updateStatus(sub.id, 'rejected')} disabled={updating === sub.id}
                          className="px-4 py-2 border border-[#D0CCC6] text-mthr-mid text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:text-mthr-black transition-colors disabled:opacity-40">
                          Reject
                        </button>
                      </>
                    )}
                    {filter === 'featured' && (
                      <>
                        <button onClick={() => updateStatus(sub.id, 'approved')} disabled={updating === sub.id}
                          className="px-4 py-2 border border-[#D0CCC6] text-mthr-mid text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:text-mthr-black transition-colors disabled:opacity-40">
                          Move to approved
                        </button>
                        <button onClick={() => updateStatus(sub.id, 'rejected')} disabled={updating === sub.id}
                          className="px-4 py-2 border border-[#D0CCC6] text-mthr-mid text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:text-mthr-black transition-colors disabled:opacity-40">
                          Reject
                        </button>
                      </>
                    )}
                    {filter === 'rejected' && (
                      <button onClick={() => updateStatus(sub.id, 'pending')} disabled={updating === sub.id}
                        className="px-4 py-2 border border-[#D0CCC6] text-mthr-mid text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm hover:text-mthr-black transition-colors disabled:opacity-40">
                        Move to pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
