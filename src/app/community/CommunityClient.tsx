'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PROMPTS: Record<number, string> = {
  1: 'the in between',
  2: 'love without looking at the camera',
  3: 'what your hands do all day',
  4: 'after the rain',
  5: 'a meal together',
  6: 'golden hour with nowhere to be',
  7: 'water',
  8: 'the last days of summer',
  9: 'back to the ordinary',
  10: 'what they carry',
  11: 'a quiet moment',
  12: 'light in the dark',
}

type ContentDay = {
  id: string
  title: string
  description: string | null
  location_name: string | null
  location_state: string | null
  event_date: string | null
  spots_total: number | null
  spots_remaining: number | null
  host_instagram: string | null
  model_instagram: string | null
  booking_url: string | null
  releasing_date: string | null
}

type OpenCall = {
  id: string
  brand_name: string
  title: string
  description: string | null
  call_type: string
  location: string | null
  closes_at: string | null
}

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  location: string | null
  avatar_url: string | null
  instagram: string | null
}

type PromptSubmission = {
  id: string
  image_url: string
  caption: string | null
  profiles: Profile | null
}

export default function CommunityClient({
  contentDays,
  openCalls,
  promptSubmissions,
  photographers,
  userId,
}: {
  contentDays: ContentDay[]
  openCalls: OpenCall[]
  promptSubmissions: PromptSubmission[]
  photographers: Profile[]
  userId: string | null
}) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('content days')
  const [showApplyForm, setShowApplyForm] = useState<string | null>(null)
  const [showPromptForm, setShowPromptForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(''

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const currentPrompt = PROMPTS[month]

  const [applyForm, setApplyForm] = useState({
    full_name: '', location: '', family_description: '',
    instagram_handle: '', photo_link: '', email: ''
  })
  const [promptImage, setPromptImage] = useState<File | null>(null)
  const [promptCaption, setPromptCaption] = useState('')

  const handleApply = async (openCallId: string) => {
    setSubmitting(true)
    try {
      await (supabase.from('open_call_applications') as any).insert({
        open_call_id: openCallId,
        ...applyForm,
      })
      setSuccess('application submitted! we'll be in touch.')
      setShowApplyForm(null)
      setApplyForm({ full_name: '', location: '', family_description: '', instagram_handle: '', photo_link: '', email: '' })
    } catch (e) {
      setSuccess('something went wrong. please try again.')
    }
    setSubmitting(false)
  }

  const handlePromptSubmit = async () => {
    if (!promptImage || !userId) return
    setSubmitting(true)
    try {
      const path = `prompts/${userId}/${year}-${month}-${Date.now()}.${promptImage.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('submissions').upload(path, promptImage)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
      await (supabase.from('prompt_submissions') as any).insert({
        photographer_id: userId, month, year, image_url: publicUrl, caption: promptCaption || null
      })
      setSuccess('image submitted!')
      setShowPromptForm(false)
      setPromptImage(null)
      setPromptCaption('')
    } catch (e) {
      setSuccess('something went wrong. please try again.')
    }
    setSubmitting(false)
  }

  const TABS = ['content days', 'monthly prompt', 'find a photographer', 'open calls']

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-8 pt-10 pb-0 border-b border-[#E8E4DE]">
        <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid mb-2">community</p>
        <p className="font-cormorant italic font-light text-[36px] leading-none text-mthr-black mb-6">
          photographers helping<br /><em>photographers.</em>
        </p>
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[9.5px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === tab ? 'border-mthr-black text-mthr-black' : 'border-transparent text-mthr-mid hover:text-mthr-black'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="mx-8 mt-4 p-3 bg-[#F0F7F0] border border-[#C5DFC5] rounded-sm text-[11px] text-mthr-black">
          {success}
        </div>
      )}

      {/* CONTENT DAYS */}
      {activeTab === 'content days' && (
        <div className="px-8 py-8">
          <div className="space-y-4">
            {contentDays.length > 0 ? contentDays.map(day => {
              const isReleased = !day.releasing_date || new Date(day.releasing_date) <= now
              return (
                <div key={day.id} className="border border-[#E8E4DE] rounded-sm overflow-hidden">
                  <div style={{ background: '#E8E2D9' }} className="px-6 py-5">
                    <p className="text-[9px] tracking-[0.18em] uppercase text-mthr-mid mb-1">
                      content day · {day.location_state ?? day.location_name}
                    </p>
                    <p className="font-cormorant italic font-light text-[26px] leading-tight text-mthr-black">
                      {day.title}
                    </p>
                  </div>
                  <div className="bg-white px-6 py-5">
                    {day.description && (
                      <p className="text-[12px] text-mthr-mid leading-[1.85] mb-5">{day.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-[#F5F2EE] rounded-sm p-3 text-center">
                        <p className="text-[9px] tracking-[0.12em] uppercase text-mthr-dim mb-1">date</p>
                        <p className="font-cormorant font-light text-[13px] text-mthr-black">
                          {day.event_date ? new Date(day.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                        </p>
                      </div>
                      <div className="bg-[#F5F2EE] rounded-sm p-3 text-center">
                        <p className="text-[9px] tracking-[0.12em] uppercase text-mthr-dim mb-1">location</p>
                        <p className="font-cormorant font-light text-[13px] text-mthr-black">{day.location_state ?? 'TBD'}</p>
                      </div>
                      <div className="bg-[#F5F2EE] rounded-sm p-3 text-center">
                        <p className="text-[9px] tracking-[0.12em] uppercase text-mthr-dim mb-1">spots</p>
                        <p className="font-cormorant font-light text-[13px] text-mthr-black">
                          {day.spots_remaining !== null ? `${day.spots_remaining} of ${day.spots_total} left` : 'limited'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4 text-[11px] text-mthr-mid">
                      {day.host_instagram && <span>hosted by @{day.host_instagram}</span>}
                      {day.model_instagram && <span>· models: @{day.model_instagram}</span>}
                    </div>
                    <div className="border-t border-[#E8E4DE] pt-4 flex items-center justify-between">
                      <div>
                        {!isReleased && day.releasing_date && (
                          <p className="text-[10px] text-mthr-dim">
                            releasing {new Date(day.releasing_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                      {day.booking_url && isReleased ? (
                        <a href={day.booking_url} target="_blank" rel="noopener noreferrer"
                          className="text-[9px] tracking-[0.16em] uppercase font-medium px-5 py-2.5 bg-mthr-black text-white hover:bg-mthr-dark transition-colors rounded-sm">
                          book your spot →
                        </a>
                      ) : (
                        <span className="text-[9px] tracking-[0.14em] uppercase text-mthr-dim border border-[#E8E4DE] px-4 py-2 rounded-sm">
                          coming soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            }) : (
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid py-12 text-center">no content days yet.</p>
            )}

            <div className="border border-dashed border-[#D0CCC6] rounded-sm p-6 text-center mt-6">
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid mb-2">hosting a content day?</p>
              <p className="text-[11px] text-mthr-dim mb-4">share it with the MTHR community.</p>
              <a href="mailto:hello@mthrmag.com?subject=Content Day Submission"
                className="inline-block text-[9px] tracking-[0.16em] uppercase font-medium px-5 py-2.5 border border-mthr-black text-mthr-black hover:bg-mthr-black hover:text-white transition-colors rounded-sm">
                get in touch →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY PROMPT */}
      {activeTab === 'monthly prompt' && (
        <div className="px-8 py-8">
          <div className="bg-mthr-black rounded-sm px-8 py-8 mb-8">
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/40 mb-3">
              {now.toLocaleDateString('en-US', { month: 'long' })} {year} · monthly prompt
            </p>
            <p className="font-cormorant italic font-light text-[38px] text-white leading-tight mb-4">
              {currentPrompt}.
            </p>
            <p className="text-[11px] text-white/50 mb-5">submit one image that captures this prompt. open through the end of the month.</p>
            {userId ? (
              <button onClick={() => setShowPromptForm(!showPromptForm)}
                className="text-[9px] tracking-[0.16em] uppercase font-medium px-5 py-2.5 border border-white/40 text-white hover:bg-white hover:text-mthr-black transition-colors rounded-sm">
                {showPromptForm ? 'cancel' : 'submit your image →'}
              </button>
            ) : (
              <Link href="/login" className="inline-block text-[9px] tracking-[0.16em] uppercase font-medium px-5 py-2.5 border border-white/40 text-white hover:bg-white hover:text-mthr-black transition-colors rounded-sm">
                sign in to submit →
              </Link>
            )}
          </div>

          {showPromptForm && (
            <div className="border border-[#E8E4DE] rounded-sm p-6 bg-white mb-8">
              <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid mb-4">submit for: {currentPrompt}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid block mb-2">your image</label>
                  <input type="file" accept="image/jpeg,image/png" onChange={e => setPromptImage(e.target.files?.[0] ?? null)}
                    className="text-[11px] text-mthr-mid w-full" />
                </div>
                <div>
                  <label className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid block mb-2">caption (optional)</label>
                  <textarea value={promptCaption} onChange={e => setPromptCaption(e.target.value)} rows={2}
                    className="w-full border border-[#E8E4DE] rounded-sm px-3 py-2 text-[12px] text-mthr-black focus:outline-none focus:border-mthr-mid" />
                </div>
                <button onClick={handlePromptSubmit} disabled={submitting || !promptImage}
                  className="text-[9px] tracking-[0.16em] uppercase font-medium px-5 py-2.5 bg-mthr-black text-white hover:bg-mthr-dark transition-colors rounded-sm disabled:opacity-50">
                  {submitting ? 'submitting…' : 'submit →'}
                </button>
              </div>
            </div>
          )}

          {promptSubmissions.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {promptSubmissions.map(sub => (
                <div key={sub.id} className="relative break-inside-avoid group">
                  <Image src={sub.image_url} alt={sub.caption ?? currentPrompt} width={600} height={900}
                    className="w-full h-auto object-cover rounded-sm" style={{ display: 'block' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col justify-end p-3">
                    {sub.caption && <p className="font-cormorant italic text-[13px] font-light text-white">{sub.caption}</p>}
                    {sub.profiles?.full_name && <p className="text-[10px] text-white/70">{sub.profiles.full_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-[#D0CCC6] rounded-sm">
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid">no submissions yet — be the first.</p>
            </div>
          )}
        </div>
      )}

      {/* FIND A PHOTOGRAPHER */}
      {activeTab === 'find a photographer' && (
        <div className="px-8 py-8">
          <p className="text-[12px] text-mthr-mid leading-[1.8] mb-6 max-w-lg">
            these photographers are available for hire. all are part of the MTHR community — documentary family work, elevated.
          </p>
          {photographers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photographers.map(p => {
                const initials = (p.full_name ?? 'M').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
                return (
                  <Link key={p.id} href={`/photographer/${p.id}`}
                    className="bg-white border border-[#E8E4DE] rounded-sm p-5 hover:border-mthr-mid transition-colors flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#E8E4DE] flex items-center justify-center">
                      {p.avatar_url ? (
                        <Image src={p.avatar_url} alt={p.full_name ?? ''} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-[14px] font-medium text-mthr-mid">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cormorant text-[18px] font-light text-mthr-black leading-none mb-0.5">{p.full_name}</p>
                      {p.location && <p className="text-[11px] text-mthr-mid mb-2">{p.location}</p>}
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] tracking-[0.1em] uppercase border border-[#D0CCC6] text-mthr-mid px-2 py-0.5 rounded-full">available for hire</span>
                        {p.instagram && <span className="text-[10px] text-mthr-dim">@{p.instagram}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-[#D0CCC6] rounded-sm">
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid mb-3">no photographers listed yet.</p>
              <Link href="/account" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors border-b border-[#D0CCC6]">
                mark yourself as available →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* OPEN CALLS */}
      {activeTab === 'open calls' && (
        <div className="px-8 py-8">
          <div className="space-y-4">
            {openCalls.length > 0 ? openCalls.map(call => (
              <div key={call.id} className="bg-white border border-[#E8E4DE] rounded-sm p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[9px] tracking-[0.14em] uppercase text-mthr-dim mb-1">
                      {call.call_type === 'casting' ? 'casting call' : 'open call'} · {call.brand_name}
                    </p>
                    <p className="font-cormorant font-light text-[20px] leading-tight text-mthr-black">{call.title}</p>
                  </div>
                  <span className="flex-shrink-0 text-[8px] tracking-[0.1em] uppercase bg-[#E8E4DE] text-mthr-dark px-2.5 py-1 rounded-full font-medium">
                    {call.call_type === 'casting' ? 'casting' : 'open call'}
                  </span>
                </div>
                {call.description && (
                  <p className="text-[12px] text-mthr-mid leading-[1.85] mb-4">{call.description}</p>
                )}
                <div className="border-t border-[#E8E4DE] pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[11px] text-mthr-dim">
                    {call.closes_at && <span>closes {new Date(call.closes_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>}
                    {call.location && <span>· {call.location}</span>}
                  </div>
                  <button onClick={() => setShowApplyForm(showApplyForm === call.id ? null : call.id)}
                    className="text-[9px] tracking-[0.16em] uppercase font-medium px-4 py-2 bg-mthr-black text-white hover:bg-mthr-dark transition-colors rounded-sm">
                    {showApplyForm === call.id ? 'close' : 'apply →'}
                  </button>
                </div>

                {showApplyForm === call.id && (
                  <div className="mt-5 pt-5 border-t border-[#E8E4DE] space-y-4">
                    <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid">application form</p>
                    {[
                      { key: 'full_name', label: 'full name', placeholder: 'your name' },
                      { key: 'email', label: 'email', placeholder: 'your@email.com' },
                      { key: 'location', label: 'location', placeholder: 'city, state' },
                      { key: 'instagram_handle', label: 'instagram handle', placeholder: '@yourhandle' },
                      { key: 'photo_link', label: 'link to photos', placeholder: 'instagram, website, or google drive link' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-[9px] tracking-[0.12em] uppercase text-mthr-mid block mb-1.5">{field.label}</label>
                        <input
                          value={(applyForm as any)[field.key]}
                          onChange={e => setApplyForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full border border-[#E8E4DE] rounded-sm px-3 py-2 text-[12px] text-mthr-black focus:outline-none focus:border-mthr-mid"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[9px] tracking-[0.12em] uppercase text-mthr-mid block mb-1.5">tell us about your family</label>
                      <textarea
                        value={applyForm.family_description}
                        onChange={e => setApplyForm(prev => ({ ...prev, family_description: e.target.value }))}
                        placeholder="ages, a little about your family..."
                        rows={3}
                        className="w-full border border-[#E8E4DE] rounded-sm px-3 py-2 text-[12px] text-mthr-black focus:outline-none focus:border-mthr-mid"
                      />
                    </div>
                    <button onClick={() => handleApply(call.id)} disabled={submitting || !applyForm.full_name || !applyForm.email}
                      className="text-[9px] tracking-[0.16em] uppercase font-medium px-5 py-2.5 bg-mthr-black text-white hover:bg-mthr-dark transition-colors rounded-sm disabled:opacity-50">
                      {submitting ? 'submitting…' : 'submit application →'}
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid py-12 text-center">no open calls right now.</p>
            )}

            <div className="border border-dashed border-[#D0CCC6] rounded-sm p-6 text-center mt-4">
              <p className="font-cormorant italic text-[18px] font-light text-mthr-mid mb-2">are you a brand looking for photographers or models?</p>
              <p className="text-[11px] text-mthr-dim mb-4">post an open call to the MTHR community.</p>
              <a href="mailto:hello@mthrmag.com?subject=Open Call Submission"
                className="inline-block text-[9px] tracking-[0.16em] uppercase font-medium px-5 py-2.5 border border-mthr-black text-mthr-black hover:bg-mthr-black hover:text-white transition-colors rounded-sm">
                get in touch →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
