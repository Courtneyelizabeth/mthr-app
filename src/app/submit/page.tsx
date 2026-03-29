'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'

// ── Magazine submission window ──────────────────────────────
const MAG_OPEN  = new Date('2026-04-01T00:00:00')
const MAG_CLOSE = new Date('2026-05-01T23:59:59')
function isMagOpen() {
  const now = new Date()
  return now >= MAG_OPEN && now <= MAG_CLOSE
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "motherhood",         label: "Motherhood" },
  { value: "editorial",          label: "Maternity" },
  { value: "kids",               label: "Kids" },
  { value: "family_documentary", label: "Family" },
  { value: "other",              label: "Other" },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
  'International'
]

const VALID_PRINT_SIZES = [
  { w: 2550, h: 3300 }, { w: 3300, h: 2550 },
  { w: 5100, h: 3300 }, { w: 3300, h: 5100 },
]

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = reject
    img.src = url
  })
}

function isPrintReady(w: number, h: number) {
  return VALID_PRINT_SIZES.some(s => s.w === w && s.h === h)
}

export default function SubmitPage() {
  const router = useRouter()
  const supabase = createClient()
  const appFileRef = useRef<HTMLInputElement>(null)
  const magFileRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'app' | 'magazine'>('app')
  const [form, setForm] = useState({
    title: '',
    city: '',
    state_code: '',
    country: '',
    venue: '',
    category: 'motherhood',
    description: '',
    subjects: '',
    instagram: '',
  })
  const [magForm, setMagForm] = useState({
    submission_statement: '',
    team_credits: '',
    copyright_declared: false,
  })
  const [appFiles, setAppFiles] = useState<File[]>([])
  const [magFiles, setMagFiles] = useState<File[]>([])
  const [sizeErrors, setSizeErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const magOpen = isMagOpen()
  const isIntl = form.state_code === 'International'

  const handleAppFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAppFiles(Array.from(e.target.files).slice(0, 1))
  }

  const handleMagFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 20)
    const errors: string[] = []
    const valid: File[] = []
    for (const file of files) {
      if (!file.type.includes('jpeg') && !file.name.toLowerCase().endsWith('.jpg')) {
        errors.push(`${file.name} — must be JPG format`); continue
      }
      try {
        const { width, height } = await getImageDimensions(file)
        if (isPrintReady(width, height)) { valid.push(file) }
        else { errors.push(`${file.name} — ${width}×${height}px is not a valid print size`) }
      } catch { errors.push(`${file.name} — could not read image`) }
    }
    setMagFiles(valid)
    setSizeErrors(errors)
  }

  const canSubmitApp = form.city const canSubmitApp = form.instagram && form.city && form.state_code && appFiles.length > 0const canSubmitApp = form.instagram && form.city && form.state_code && appFiles.length > 0 form.state_code const canSubmitApp = form.instagram && form.city && form.state_code && appFiles.length > 0const canSubmitApp = form.instagram && form.city && form.state_code && appFiles.length > 0 appFiles.length > 0
  const canSubmitMag = form.title && form.city && form.state_code && magFiles.length >= 10 && magForm.copyright_declared

  const handleSubmit = async () => {
    setError(null)
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/submit'); return }

      const filesToUpload = tab === 'app' ? appFiles : magFiles
      if (filesToUpload.length === 0) { setError('Please select at least one image.'); setUploading(false); return }

      const imageUrls: string[] = []
      for (const file of filesToUpload) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${tab}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('submissions').upload(path, file, { upsert: false })
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      const locationName = isIntl
        ? `${form.city}${form.venue ? ` · ${form.venue}` : ''}`
        : `${form.city}, ${form.state_code}${form.venue ? ` · ${form.venue}` : ''}`

      const fullDescription = tab === 'magazine'
        ? [form.description, magForm.submission_statement ? `Statement: ${magForm.submission_statement}` : '', magForm.team_credits ? `Credits: ${magForm.team_credits}` : ''].filter(Boolean).join('\n\n')
        : form.description

      const { error: insertError } = await supabase.from('submissions').insert({
        photographer_id: user.id,
        title: form.title,
        description: fullDescription,
        location_name: locationName,
        location_country: isIntl ? (form.country || 'International') : 'USA',
        location_state: form.city,
        location_state_code: form.state_code,
        category: form.category,
        submission_type: tab,
        images: imageUrls,
        cover_image: imageUrls[0] ?? null,
        subjects: form.subjects || null,
        instagram_handle: form.instagram || null,
      })

      if (insertError) throw new Error(insertError.message)

      // Send email notifications
      try {
        const notifyRes = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'submission_received',
            photographer_name: user?.user_metadata?.full_name ?? 'Photographer',
            photographer_email: user?.email || user?.user_metadata?.email || '',
            submission_title: form.title,
            location: isIntl ? (form.country || 'International') : `${form.city}, ${form.state_code}`,
          }),
        })
        console.log('Email notify status:', notifyRes.status)
      } catch (emailErr) {
        console.error('Email notify error:', emailErr)
      }

      router.push('/submit/thank-you')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* Header */}
        <div className="px-8 pt-10 pb-6 border-b border-[#E8E4DE]">
          <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black">
            submit your <em>work.</em>
          </h1>
          <p className="text-[12px] text-mthr-mid mt-2">
            we're looking for photographers who see the world differently. your work, your story, your community. full credit always.
          </p>
          <div className="mt-4 px-4 py-3 bg-mthr-black text-white rounded-sm flex items-center justify-between gap-4">
            <p className="text-[12px] text-white/80">a free account is required to submit your work.</p>
            <div className="flex gap-3 flex-shrink-0">
              <a href="/login" className="text-[10px] tracking-[0.14em] uppercase text-white/70 hover:text-white transition-colors">sign in</a>
              <a href="/signup" className="text-[10px] tracking-[0.14em] uppercase font-medium text-white border-b border-white/50 hover:border-white transition-colors">join free</a>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-0 mt-6 border-b border-[#E8E4DE]">
            <button onClick={() => setTab('app')}
              className={`px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px ${
                tab === 'app' ? 'border-mthr-black text-mthr-black' : 'border-transparent text-mthr-mid hover:text-mthr-black'
              }`}>
              App feature
            </button>
            <button
              onClick={() => { if (magOpen) setTab('magazine') }}
              className={`px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px relative ${
                tab === 'magazine' ? 'border-mthr-black text-mthr-black'
                : magOpen ? 'border-transparent text-mthr-mid hover:text-mthr-black'
                : 'border-transparent text-mthr-dim cursor-not-allowed'
              }`}>
              Print magazine
              {magOpen ? (
                <span className="ml-2 text-[8px] tracking-[0.08em] bg-mthr-black text-white px-1.5 py-0.5 rounded-full">Open</span>
              ) : (
                <span className="ml-2 text-[8px] tracking-[0.08em] bg-mthr-b1 text-mthr-mid px-1.5 py-0.5 rounded-full">Opens Apr 1</span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT — FORM */}
          <div className="px-10 py-10 bg-white border-r border-[#E8E4DE]">

            {/* Magazine locked state */}
            {tab === 'magazine' && !magOpen && (
              <div className="py-16 text-center">
                <h2 className="font-cormorant font-light text-[32px] text-mthr-black mb-3">
                  submissions <em>open soon.</em>
                </h2>
                <p className="text-[12px] text-mthr-mid leading-[1.8]">
                  magazine submissions open <strong>April 1 — May 1, 2026.</strong>
                  <br />come back then to submit your print-ready work.
                </p>
              </div>
            )}

            {(tab === 'app' || (tab === 'magazine' && magOpen)) && (
              <div className="space-y-4">
                <Field label="Your Instagram handle">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-mthr-mid">@</span>
                    <input type="text" placeholder="yourhandle" value={form.instagram}
                      onChange={e => setForm(f => ({ ...f, instagram: e.target.value.replace('@', '') }))}
                      className="w-full pl-7 pr-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </div>
                </Field>
                {tab === 'magazine' && (
                  <Field label="Title *">
                    <input type="text" placeholder="e.g. Luz - A Family in Oaxaca"
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </Field>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Field label="City *">
                    <input type="text" placeholder="Denver" value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </Field>
                  <Field label="State *">
                    <select value={form.state_code} onChange={e => setForm(f => ({ ...f, state_code: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors">
                      <option value="">Select...</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>

                {isIntl && (
                  <Field label="Country">
                    <input type="text" placeholder="Italy" value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </Field>
                )}

                <Field label="Venue or park name (optional)">
                  <input type="text" placeholder="e.g. Rocky Mountain National Park"
                    value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                </Field>

                {/* Location preview */}
                {form.city && form.state_code && (
                  <div className="px-3 py-2 bg-[#F5F2EE] rounded-sm border border-[#E8E4DE]">
                    <span className="text-[9px] tracking-[0.12em] uppercase text-mthr-mid font-medium">appears as: </span>
                    <span className="text-[13px] text-mthr-black">
                      {isIntl ? form.city : `${form.city}, ${form.state_code}`}{form.venue ? ` · ${form.venue}` : ''}
                    </span>
                  </div>
                )}

                <Field label="Collab or brand credits (optional)">
                  <input type="text" placeholder="e.g. Styled by The Bloom Studio, MUA: Sarah Jones"
                    value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                </Field>

                <Field label="Category">
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>

                <Field label={tab === 'app' ? 'About this work (optional)' : 'About this work'}>
                  <textarea placeholder="tell us about the session..." value={form.description} rows={3}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors resize-none leading-relaxed" />
                </Field>

                {/* Magazine extra fields */}
                {tab === 'magazine' && magOpen && (
                  <div className="border-t border-[#E8E4DE] pt-5 space-y-4">
                    <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid font-medium">Magazine details</p>

                    <Field label="Submission statement (optional)">
                      <textarea placeholder="share the story or intention behind this work..."
                        value={magForm.submission_statement} rows={4}
                        onChange={e => setMagForm(f => ({ ...f, submission_statement: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors resize-none leading-relaxed" />
                    </Field>

                    <Field label="Team credits (optional)">
                      <textarea placeholder="second shooter, stylist, hair & makeup..."
                        value={magForm.team_credits} rows={2}
                        onChange={e => setMagForm(f => ({ ...f, team_credits: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors resize-none leading-relaxed" />
                    </Field>

                    <label className="flex items-start gap-3 cursor-pointer p-4 border border-[#D0CCC6] rounded-sm bg-[#F5F2EE]">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input type="checkbox" checked={magForm.copyright_declared}
                          onChange={e => setMagForm(f => ({ ...f, copyright_declared: e.target.checked }))}
                          className="sr-only" />
                        <div className={`w-4 h-4 rounded-sm border transition-colors flex items-center justify-center ${magForm.copyright_declared ? 'bg-mthr-black border-mthr-black' : 'bg-white border-[#D0CCC6]'}`}>
                          {magForm.copyright_declared && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-mthr-black leading-[1.5]">
                          I declare that I am the copyright owner of all submitted images *
                        </p>
                        <p className="text-[10px] text-mthr-mid leading-[1.6] mt-1">
                          all images are original work, JPG format, sRGB color profile, and i have the right to license them for print publication in MTHR Magazine.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {error && <p className="text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}

                <button onClick={handleSubmit}
                  disabled={uploading || (tab === 'app' ? !canSubmitApp : !canSubmitMag)}
                  className="w-full py-3.5 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {uploading ? 'submitting…' : tab === 'app' ? 'submit your work →' : 'submit for magazine consideration →'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — UPLOAD */}
          <div className="px-10 py-10 bg-[#F5F2EE]">
            {tab === 'app' ? (
              <>
                <h2 className="font-cormorant font-light text-[32px] leading-none text-mthr-black mb-2">
                  your <em>images.</em>
                </h2>
                <p className="text-[11px] text-mthr-mid mb-6">upload your 1 hero image from the session.</p>

                <div onClick={() => appFileRef.current?.click()} onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) setAppFiles(Array.from(e.dataTransfer.files).slice(0, 1)) }}
                  className="border border-dashed border-[#D0CCC6] rounded-sm p-8 text-center cursor-pointer hover:bg-white hover:border-mthr-mid transition-all mb-8">
                  <div className="text-[24px] text-mthr-dim mb-2">+</div>
                  <div className="text-[10px] tracking-[0.1em] uppercase text-mthr-mid font-medium">
                    {appFiles.length > 0 ? '1 image selected' : 'drag & drop or click to upload'}
                  </div>
                  <div className="font-cormorant italic text-[12px] text-mthr-dim mt-1">jpg or png · high resolution preferred</div>
                  <input ref={appFileRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handleAppFiles} />
                </div>

                <h3 className="font-cormorant font-light text-[20px] text-mthr-black mb-4">guidelines.</h3>
                <div className="divide-y divide-[#E8E4DE]">
                  {[
                    { n: '01', h: '1 hero image', t: 'choose your single strongest image from this session.' },
                    { n: '02', h: 'your image, your rights.', t: 'submission confirms you hold full copyright for every image you share.' },
                    { n: '03', h: 'give credit where it is due.', t: 'if this was made with others — a stylist, second shooter, or workshop host — please credit them.' },
                    
                  ].map(g => (
                    <div key={g.n} className="py-3.5">
                      <div className="text-[9px] tracking-[0.1em] text-mthr-dim mb-0.5">{g.n}.</div>
                      <div className="text-[11px] font-medium text-mthr-black uppercase tracking-[0.06em] mb-0.5">{g.h}</div>
                      <div className="text-[11px] text-mthr-mid leading-[1.6]">{g.t}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : magOpen ? (
              <>
                <h2 className="font-cormorant font-light text-[32px] leading-none text-mthr-black mb-2">
                  print-ready <em>images.</em>
                </h2>
                <p className="text-[11px] text-mthr-mid mb-6">upload 10–20 print-ready JPG images.</p>

                <div onClick={() => magFileRef.current?.click()} onDragOver={e => e.preventDefault()}
                  className="border border-dashed border-[#D0CCC6] rounded-sm p-8 text-center cursor-pointer hover:bg-white hover:border-mthr-mid transition-all mb-4">
                  <div className="text-[24px] text-mthr-dim mb-2">+</div>
                  <div className="text-[10px] tracking-[0.1em] uppercase text-mthr-mid font-medium">
                    {magFiles.length > 0 ? `${magFiles.length} image${magFiles.length > 1 ? 's' : ''} ready (${magFiles.length}/20)` : 'upload 10–20 print-ready jpg images'}
                  </div>
                  <div className="font-cormorant italic text-[12px] text-mthr-dim mt-1">jpg · sRGB · exact print dimensions required</div>
                  <input ref={magFileRef} type="file" accept="image/jpeg" multiple className="hidden" onChange={handleMagFiles} />
                </div>

                {sizeErrors.length > 0 && (
                  <div className="mb-4 px-3 py-3 bg-red-50 rounded-sm border border-red-100">
                    <p className="text-[9px] tracking-[0.1em] uppercase text-red-600 font-medium mb-2">{sizeErrors.length} rejected:</p>
                    {sizeErrors.map((e, i) => <p key={i} className="text-[11px] text-red-600">{e}</p>)}
                  </div>
                )}
                {magFiles.length > 0 && (
                  <div className="mb-6 px-3 py-3 bg-white rounded-sm border border-[#E8E4DE]">
                    <p className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid font-medium mb-2">Accepted ({magFiles.length}/20):</p>
                    {magFiles.map((f, i) => <p key={i} className="text-[11px] text-mthr-black">{f.name}</p>)}
                  </div>
                )}

                <h3 className="font-cormorant font-light text-[20px] text-mthr-black mb-4">print requirements.</h3>
                <div className="divide-y divide-[#E8E4DE]">
                  {[
                    { n: '01', h: 'jpg format only', t: 'all images must be saved as JPG. no TIFF, PNG or RAW.' },
                    { n: '02', h: 'sRGB color profile', t: 'export with sRGB. do not submit Adobe RGB or CMYK.' },
                    { n: '03', h: 'portrait — 2550 × 3300px', t: '8.5 × 11 inches at 300dpi. single-page portrait spreads.' },
                    { n: '04', h: 'landscape — 5100 × 3300px', t: '17 × 11 inches at 300dpi. full double-page spreads.' },
                    { n: '05', h: 'copyright owner only', t: 'you must be the original photographer and copyright holder.' },
                    { n: '06', h: '10–20 images', t: 'minimum 10, maximum 20 images per submission.' },
                  ].map(g => (
                    <div key={g.n} className="py-3.5">
                      <div className="text-[9px] tracking-[0.1em] text-mthr-dim mb-0.5">{g.n}.</div>
                      <div className="text-[11px] font-medium text-mthr-black uppercase tracking-[0.06em] mb-0.5">{g.h}</div>
                      <div className="text-[11px] text-mthr-mid leading-[1.6]">{g.t}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <h2 className="font-cormorant font-light text-[28px] text-mthr-black mb-3">
                  magazine submissions <em>open april 1.</em>
                </h2>
                <p className="text-[12px] text-mthr-mid leading-[1.8]">
                  the magazine submission window opens april 1 — may 1, 2026.<br />
                  in the meantime, submit your work to the app feature.
                </p>
              </div>
            )}
          </div>
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
