'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mthr-admin-2026'

type Submission = {
  id: string
  title: string
  location_name: string
  location_country: string
  category: string
  status: string
  submission_type: string
  subjects: string | null
  instagram_handle: string | null
  description: string | null
  cover_image: string | null
  images: string[]
  created_at: string
  profiles: { full_name: string | null; username: string | null; instagram: string | null } | null
}

export default function AdminPage() {
  const supabase = createClient()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'featured' | 'rejected'>('pending')
  const [updating, setUpdating] = useState<string | null>(null)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true)
    else alert('Incorrect password')
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('submissions')
      .select(`
        id, title, location_name, location_country, category, status,
        submission_type, subjects, instagram_handle, description,
        cover_image, images, created_at,
        profiles:photographer_id (full_name, username, instagram)
      `)
      .eq('status', filter)
      .eq('submission_type', 'app')
      .order('created_at', { ascending: false })
    setSubmissions(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (authed) fetchSubmissions()
  }, [authed, filter])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await supabase.from('submissions').update({ status }).eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
    setUpdating(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-mthr-off flex items-center justify-center">
        <div className="bg-mthr-white rounded-sm p-10 w-full max-w-sm border border-mthr-b1">
          <div className="font-bebas text-[28px] tracking-[0.1em] text-mthr-black mb-1">MTHR</div>
          <h1 className="font-cormorant font-light text-[28px] text-mthr-black mb-6">
            Admin <em>access.</em>
          </h1>
          <div className="mb-4">
            <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              className="w-full px-3 py-2.5 border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-mthr-black text-mthr-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors"
          >
            Sign in →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mthr-off">

      {/* Header */}
      <div className="bg-mthr-white border-b border-mthr-b1 px-7 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bebas text-[22px] tracking-[0.1em] text-mthr-black">MTHR</span>
          <span className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid font-medium">Admin</span>
        </div>
        <Link href="/explore" className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors">
          View site →
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="bg-mthr-white border-b border-mthr-b1 px-7 flex gap-1">
        {(['pending', 'approved', 'featured', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-3 text-[9px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors ${
              filter === s ? 'border-mthr-black text-mthr-black' : 'border-transparent text-mthr-mid hover:text-mthr-black'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-7 py-8">
        {loading ? (
          <p className="text-[12px] text-mthr-mid">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-cormorant italic text-[20px] font-light text-mthr-mid">
              No {filter} submissions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {submissions.map(sub => (
              <div key={sub.id} className="bg-mthr-white border border-mthr-b1 rounded-sm overflow-hidden">
                <div className="flex">

                  {/* Image grid */}
                  <div className="w-[280px] flex-shrink-0">
                    {sub.images && sub.images.length > 0 ? (
                      <div className={`grid gap-[2px] h-[200px] ${sub.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {sub.images.slice(0, 4).map((img, i) => (
                          <div key={i} className="relative overflow-hidden photo-warm-1">
                            <Image src={img} alt={sub.title} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] photo-warm-1" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="font-bebas text-[20px] tracking-[0.05em] text-mthr-black">{sub.title.toUpperCase()}</h2>
                        <p className="font-cormorant italic text-[13px] font-light text-mthr-mid mt-0.5">
                          {sub.location_name}, {sub.location_country}
                        </p>
                      </div>
                      <span className="text-[8px] tracking-[0.1em] uppercase bg-mthr-b1 text-mthr-dark px-2 py-1 rounded-sm font-medium">
                        {sub.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-3 text-[11px] text-mthr-mid">
                      {sub.subjects && <span>People: <strong className="text-mthr-black">{sub.subjects}</strong></span>}
                      {sub.instagram_handle && (
                        <a href={`https://instagram.com/${sub.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                          className="text-mthr-black hover:opacity-70 transition-opacity">
                          @{sub.instagram_handle}
                        </a>
                      )}
                      <span>By: <strong className="text-mthr-black">{sub.profiles?.full_name ?? 'Unknown'}</strong></span>
                      <span>{sub.images?.length ?? 0} image{(sub.images?.length ?? 0) > 1 ? 's' : ''}</span>
                      <span>{new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {sub.description && (
                      <p className="text-[11px] text-mthr-mid leading-[1.7] mb-4 line-clamp-2">{sub.description}</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-auto">
                      {filter === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(sub.id, 'approved')}
                            disabled={updating === sub.id}
                            className="px-4 py-2 bg-mthr-black text-mthr-white text-[9px] tracking-[0.14em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40"
                          >
                            {updating === sub.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => updateStatus(sub.id, 'featured')}
                            disabled={updating === sub.id}
                            className="px-4 py-2 bg-mthr-dark text-mthr-white text-[9px] tracking-[0.14em] uppercase font-medium rounded-sm hover:opacity-80 transition-opacity disabled:opacity-40"
                          >
                            Feature
                          </button>
                          <button
                            onClick={() => updateStatus(sub.id, 'rejected')}
                            disabled={updating === sub.id}
                            className="px-4 py-2 bg-transparent text-mthr-mid border border-mthr-b2 text-[9px] tracking-[0.14em] uppercase font-medium rounded-sm hover:border-mthr-mid hover:text-mthr-black transition-colors disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {filter === 'approved' && (
                        <>
                          <button onClick={() => updateStatus(sub.id, 'featured')} disabled={updating === sub.id}
                            className="px-4 py-2 bg-mthr-black text-mthr-white text-[9px] tracking-[0.14em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40">
                            Feature
                          </button>
                          <button onClick={() => updateStatus(sub.id, 'rejected')} disabled={updating === sub.id}
                            className="px-4 py-2 bg-transparent text-mthr-mid border border-mthr-b2 text-[9px] tracking-[0.14em] uppercase font-medium rounded-sm hover:text-mthr-black transition-colors disabled:opacity-40">
                            Reject
                          </button>
                        </>
                      )}
                      {(filter === 'rejected') && (
                        <button onClick={() => updateStatus(sub.id, 'pending')} disabled={updating === sub.id}
                          className="px-4 py-2 bg-transparent text-mthr-mid border border-mthr-b2 text-[9px] tracking-[0.14em] uppercase font-medium rounded-sm hover:text-mthr-black transition-colors disabled:opacity-40">
                          Move to pending
                        </button>
                      )}
                    </div>
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
