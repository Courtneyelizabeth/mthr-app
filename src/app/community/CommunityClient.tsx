'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Post = {
  id: string
  type: string
  title: string
  description: string | null
  location_name: string | null
  location_state: string | null
  event_date: string | null
  spots_available: number | null
  instagram_handle: string | null
  image_url: string | null
  created_at: string
  profiles: { full_name: string | null; username: string | null; instagram: string | null } | null
}

type Project365Entry = {
  id: string
  day_number: number
  image_url: string
  caption: string | null
  created_at: string
  profiles: { full_name: string | null; username: string | null; avatar_url: string | null } | null
}

const TABS = ['all', 'workshops', 'content days', '365 project']
const POST_TYPES = ['workshop', 'content_day']

export default function CommunityClient({
  posts,
  project365,
  userId,
}: {
  posts: Post[]
  project365: Project365Entry[]
  userId: string | null
}) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [show365Form, setShow365Form] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const image365Ref = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    type: 'workshop',
    title: '',
    description: '',
    location_name: '',
    location_state: '',
    event_date: '',
    spots_available: '',
    instagram_handle: '',
  })

  const [form365, setForm365] = useState({
    caption: '',
    image: null as File | null,
  })

  const filteredPosts = activeTab === 'all'
    ? posts.filter(p => p.type !== '365')
    : activeTab === 'workshops'
    ? posts.filter(p => p.type === 'workshop')
    : activeTab === 'content days'
    ? posts.filter(p => p.type === 'content_day')
    : []

  const handleSubmitPost = async () => {
    if (!userId) { window.location.href = "/login?redirectTo=/community"; return }
    setSubmitting(true)
    let imageUrl = null

    // Upload image if provided
    const file = imageRef.current?.files?.[0]
    if (file) {
      const path = `community/${userId}/${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('submissions').upload(path, file)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
        imageUrl = publicUrl
      }
    }

    await supabase.from('community_posts').insert({
      photographer_id: userId,
      type: form.type,
      title: form.title,
      description: form.description || null,
      location_name: form.location_name || null,
      location_state: form.location_state || null,
      event_date: form.event_date || null,
      spots_available: form.spots_available ? parseInt(form.spots_available) : null,
      instagram_handle: form.instagram_handle || null,
      image_url: imageUrl,
    })

    setSuccess(true)
    setShowForm(false)
    setSubmitting(false)
  }

  const handleSubmit365 = async () => {
    if (!userId) { window.location.href = "/login?redirectTo=/community"; return }
    if (!form365.image) return
    setSubmitting(true)

    const path = `365/${userId}/${Date.now()}.${form365.image.name.split('.').pop()}`
    const { error } = await supabase.storage.from('submissions').upload(path, form365.image)
    if (error) { setSubmitting(false); return }

    const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
    const dayNum = project365.filter(e => {
      const profiles = e.profiles as { username?: string | null } | null
      return profiles?.username === userId
    }).length + 1

    await supabase.from('project_365').insert({
      photographer_id: userId,
      day_number: dayNum,
      image_url: publicUrl,
      caption: form365.caption || null,
      date_taken: form365.date_taken || new Date().toISOString().split('T')[0],
    })

    setShow365Form(false)
    setSubmitting(false)
    window.location.reload()
  }

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-10 pb-6 border-b border-[#E8E4DE]">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black">
            the <em>community.</em>
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="text-[10px] tracking-[0.16em] uppercase font-medium px-4 py-2 border border-mthr-black text-mthr-black hover:bg-mthr-black hover:text-white transition-colors rounded-sm"
          >
            + Add yours
          </button>
        </div>
        <p className="text-[12px] text-mthr-mid leading-[1.7] max-w-xl mt-2">
          workshops, content days and the 365 project. a place to share, connect and grow alongside photographers who see the world the way you do.
        </p>

        {/* Tabs */}
        <div className="flex gap-0 mt-6 border-b border-[#E8E4DE]">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? 'border-mthr-black text-mthr-black'
                  : 'border-transparent text-mthr-mid hover:text-mthr-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="mx-8 mt-6 px-4 py-3 bg-white border border-[#E8E4DE] rounded-sm">
          <p className="text-[12px] text-mthr-black">your submission has been received and will appear once approved. thank you!</p>
        </div>
      )}

      {/* Community dark banner */}
      {activeTab !== '365 project' && (
        <div className="mx-8 mt-6 bg-mthr-black text-white rounded-sm p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/50 mb-2">Share with the community</p>
            <h2 className="font-cormorant italic font-light text-[26px] md:text-[32px] leading-tight text-white mb-2">
              have a workshop or content day<br className="hidden md:block" /> you want to share? add it here.
            </h2>
            <p className="text-[12px] text-white/60 leading-[1.7]">open to all photographers. full credit always. connect with others who are doing the work.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex-shrink-0 text-[10px] tracking-[0.16em] uppercase font-medium px-6 py-3 border border-white/50 text-white hover:bg-white hover:text-mthr-black transition-colors rounded-sm"
          >
            + add yours
          </button>
        </div>
      )}

      {/* WORKSHOPS + CONTENT DAYS */}
      {activeTab !== '365 project' && (
        <div className="px-8 py-8">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-sm border border-[#E8E4DE] overflow-hidden">
                  {post.image_url && (
                    <div className="relative h-48 photo-warm-1">
                      <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[8px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full ${
                          post.type === 'workshop'
                            ? 'bg-mthr-black text-white'
                            : 'bg-white text-mthr-black border border-mthr-black'
                        }`}>
                          {post.type === 'workshop' ? 'Workshop' : 'Content day'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-cormorant text-[20px] font-light text-mthr-black leading-tight mb-1">
                      {post.title}
                    </h3>
                    {post.event_date && (
                      <p className="text-[10px] tracking-[0.1em] text-mthr-mid mb-1">
                        {new Date(post.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        {post.location_name && ` · ${post.location_name}`}
                        {post.location_state && `, ${post.location_state}`}
                        {post.spots_available && ` · ${post.spots_available} spots`}
                      </p>
                    )}
                    {post.description && (
                      <p className="text-[12px] text-mthr-mid leading-[1.7] mt-2 line-clamp-3">{post.description}</p>
                    )}
                    {post.instagram_handle && (
                      <a
                        href={`https://instagram.com/${post.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-[9px] tracking-[0.1em] uppercase text-mthr-mid hover:text-mthr-black transition-colors"
                      >
                        hosted by @{post.instagram_handle} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-cormorant italic text-[20px] font-light text-mthr-mid">
                no {activeTab} yet.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-block mt-4 text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors"
              >
                be the first to add one →
              </button>
            </div>
          )}
        </div>
      )}

      {/* 365 PROJECT */}
      {activeTab === '365 project' && (
        <div className="px-8 py-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="font-cormorant font-light text-[28px] text-mthr-black">
                the <em>365 project.</em>
              </h2>
              <p className="text-[11px] text-mthr-mid mt-1">
                one image. every day. a community committed to showing up for their craft.
              </p>
            </div>
            {userId ? (
              <button
                onClick={() => setShow365Form(true)}
                className="text-[10px] tracking-[0.16em] uppercase font-medium px-4 py-2 border border-mthr-black text-mthr-black hover:bg-mthr-black hover:text-white transition-colors rounded-sm"
              >
                + add today's image
              </button>
            ) : (
              <a href="/login"
                className="text-[10px] tracking-[0.16em] uppercase font-medium px-4 py-2 border border-mthr-black text-mthr-black hover:bg-mthr-black hover:text-white transition-colors rounded-sm"
              >
                sign in to join →
              </a>
            )}
          </div>

          {project365.length > 0 ? (
            <div className="columns-2 md:columns-4 gap-2 space-y-2">
              {project365.map((entry) => (
                <div key={entry.id} className="relative break-inside-avoid group">
                  <Image
                    src={entry.image_url}
                    alt={`Day ${entry.day_number}`}
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover rounded-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col justify-end p-2.5">
                    <div className="text-[10px] tracking-[0.08em] text-white/80">day {entry.day_number}</div>
                    {entry.profiles?.full_name && (
                      <div className="text-[9px] text-white/60">{entry.profiles.full_name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-cormorant italic text-[20px] font-light text-mthr-mid">
                no images yet. be the first to start your 365.
              </p>
            </div>
          )}
        </div>
      )}

      {/* EDUCATION BLOCK */}
      {activeTab !== '365 project' && (
        <div className="mx-8 mb-8 border border-[#E8E4DE] rounded-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="px-8 py-10 bg-white">
              <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-3">coming soon</p>
              <h2 className="font-cormorant font-light text-[32px] leading-tight text-mthr-black mb-3">
                education &amp; <em>behind the scenes.</em>
              </h2>
              <p className="text-[12px] text-mthr-mid leading-[1.8]">
                process videos and real insight into the work. coming soon to MTHR.
              </p>
            </div>
            <div className="bg-[#F5F2EE] flex items-center justify-center px-8 py-10">
              <div className="w-full aspect-video bg-[#E8E4DE] rounded-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border border-[#D0CCC6] flex items-center justify-center mx-auto mb-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 4l6 4-6 4V4z" fill="#A8A29E"/>
                    </svg>
                  </div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-dim font-medium">video coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT POST FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE]">
              <h2 className="font-cormorant font-light text-[24px] text-mthr-black">
                share with the <em>community.</em>
              </h2>
              <button onClick={() => setShowForm(false)} className="text-mthr-mid hover:text-mthr-black text-[20px] leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Type</label>
                <div className="flex gap-2">
                  {POST_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`px-4 py-2 text-[9px] tracking-[0.12em] uppercase font-medium rounded-sm border transition-colors ${
                        form.type === t ? 'bg-mthr-black text-white border-mthr-black' : 'border-[#D0CCC6] text-mthr-mid hover:text-mthr-black'
                      }`}
                    >
                      {t === 'workshop' ? 'Workshop' : 'Content Day'}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Title *">
                <input type="text" placeholder="Golden hour family workshop" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mthr-input" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input type="text" placeholder="Denver" value={form.location_name}
                    onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
                    className="mthr-input" />
                </Field>
                <Field label="State">
                  <input type="text" placeholder="CO" value={form.location_state}
                    onChange={e => setForm(f => ({ ...f, location_state: e.target.value }))}
                    className="mthr-input" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input type="date" value={form.event_date}
                    onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                    className="mthr-input" />
                </Field>
                <Field label="Spots available">
                  <input type="number" placeholder="8" value={form.spots_available}
                    onChange={e => setForm(f => ({ ...f, spots_available: e.target.value }))}
                    className="mthr-input" />
                </Field>
              </div>
              <Field label="Instagram handle">
                <input type="text" placeholder="@yourhandle" value={form.instagram_handle}
                  onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value.replace('@', '') }))}
                  className="mthr-input" />
              </Field>
              <Field label="Description">
                <textarea placeholder="Tell us about your workshop or content day..." value={form.description} rows={3}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mthr-input resize-none leading-relaxed" />
              </Field>
              <Field label="Image (optional)">
                <input ref={imageRef} type="file" accept="image/jpeg,image/png" className="text-[12px] text-mthr-mid" />
              </Field>

              <button
                onClick={handleSubmitPost}
                disabled={submitting || !form.title}
                className="w-full py-3 bg-mthr-black text-white text-[10px] tracking-[0.16em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40"
              >
                {submitting ? 'Submitting…' : 'Submit for review →'}
              </button>
              <p className="text-[10px] text-mthr-mid text-center">posts are reviewed before appearing publicly</p>
            </div>
          </div>
        </div>
      )}

      {/* 365 UPLOAD MODAL */}
      {show365Form && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm max-w-sm w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE]">
              <h2 className="font-cormorant font-light text-[22px] text-mthr-black">
                today's <em>image.</em>
              </h2>
              <button onClick={() => setShow365Form(false)} className="text-mthr-mid hover:text-mthr-black text-[20px] leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div
                onClick={() => image365Ref.current?.click()}
                className="border border-dashed border-[#D0CCC6] rounded-sm p-8 text-center cursor-pointer hover:border-mthr-mid transition-colors"
              >
                <div className="text-[22px] text-mthr-dim mb-1">+</div>
                <div className="text-[10px] tracking-[0.1em] uppercase text-mthr-mid">
                  {form365.image ? form365.image.name : 'Upload today\'s image'}
                </div>
                <input ref={image365Ref} type="file" accept="image/jpeg,image/png" className="hidden"
                  onChange={e => setForm365(f => ({ ...f, image: e.target.files?.[0] ?? null }))} />
              </div>
              <Field label="Date taken *">
                <input type="date" value={form365.date_taken}
                  onChange={e => setForm365(f => ({ ...f, date_taken: e.target.value }))}
                  className="mthr-input" />
                <p className="text-[10px] text-mthr-mid mt-1">catching up? use the date the photo was actually taken.</p>
              </Field>
              <Field label="Caption (optional)">
                <input type="text" placeholder="what do you see today?" value={form365.caption}
                  onChange={e => setForm365(f => ({ ...f, caption: e.target.value }))}
                  className="mthr-input" />
              </Field>
              <button
                onClick={handleSubmit365}
                disabled={submitting || !form365.image}
                className="w-full py-3 bg-mthr-black text-white text-[10px] tracking-[0.16em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40"
              >
                {submitting ? 'Uploading…' : 'Add to my 365 →'}
              </button>
            </div>
          </div>
        </div>
      )}
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
