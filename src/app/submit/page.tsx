'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import type { SubmissionCategory } from '@/types/database'

const CATEGORIES: { value: SubmissionCategory; label: string }[] = [
  { value: 'family_documentary', label: 'Family' },
  { value: 'motherhood', label: 'Motherhood' },
  { value: 'fatherhood', label: 'Fatherhood' },
  { value: 'newborn', label: 'Newborn' },
  { value: 'love_couples', label: 'Love & couples' },
  { value: 'editorial', label: 'Editorial' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
  'International'
]

// Valid print dimensions
const VALID_PRINT_SIZES = [
  { w: 2550, h: 3300, label: '8.5×11 portrait' },
  { w: 3300, h: 2550, label: '11×8.5 landscape' },
  { w: 5100, h: 3300, label: '17×11 landscape' },
  { w: 3300, h: 5100, label: '11×17 portrait' },
]

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = reject
    img.src = url
  })
}

function isPrintReady(w: number, h: number) {
  return VALID_PRINT_SIZES.some(s => s.w === w && s.h === h)
}

function getSizeLabel(w: number, h: number) {
  return VALID_PRINT_SIZES.find(s => s.w === w && s.h === h)?.label ?? `${w}×${h}`
}

export default function SubmitPage() {
  const router = useRouter()
  const supabase = createClient()
  const appFileRef = useRef<HTMLInputElement>(null)
  const magFileRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'app' | 'magazine'>('app')

  // Shared fields
  const [form, setForm] = useState({
    title: '',
    city: '',
    state_code: '',
    country: '',
    category: 'family_documentary' as SubmissionCategory,
    description: '',
    subjects: '',
    instagram: '',
  })

  // Magazine-only fields
  const [magForm, setMagForm] = useState({
    submission_statement: '',
    team_credits: '',
    copyright_declared: false,
  })

  // Files
  const [appFiles, setAppFiles] = useState<File[]>([])
  const [magFiles, setMagFiles] = useState<File[]>([])
  const [sizeErrors, setSizeErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAppFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAppFiles(Array.from(e.target.files).slice(0, 10))
  }

  const handleMagFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 20)
    const errors: string[] = []
    const valid: File[] = []

    for (const file of files) {
      // Check format
      if (!file.type.includes('jpeg') && !file.name.toLowerCase().endsWith('.jpg')) {
        errors.push(`${file.name} — must be JPG format`)
        continue
      }
      // Check dimensions
      try {
        const { width, height } = await getImageDimensions(file)
        if (isPrintReady(width, height)) {
          valid.push(file)
        } else {
          errors.push(`${file.name} — ${width}×${height}px is not a valid print size`)
        }
      } catch {
        errors.push(`${file.name} — could not read image`)
      }
    }

    setMagFiles(valid)
    setSizeErrors(errors)
  }

  const canSubmitMag =
    form.title &&
    form.city &&
    form.state_code &&
    magFiles.length > 0 &&
    magForm.copyright_declared

  const canSubmitApp =
    form.title &&
    form.city &&
    form.state_code &&
    appFiles.length > 0

  const handleSubmit = async () => {
    setError(null)
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/submit'); return }

      const filesToUpload = tab === 'app' ? appFiles : magFiles

      if (filesToUpload.length === 0) {
        setError('Please select at least one image.')
        setUploading(false)
        return
      }

      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      for (const file of filesToUpload) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${tab}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(path, file, { upsert: false })
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      const isIntl = form.state_code === 'International'
      const locationName = isIntl ? form.city : `${form.city}, ${form.state_code}`

      // Build description — combine description + magazine fields
      const fullDescription = tab === 'magazine'
        ? [
            form.description,
            magForm.submission_statement ? `Statement: ${magForm.submission_statement}` : '',
            magForm.team_credits ? `Credits: ${magForm.team_credits}` : '',
          ].filter(Boolean).join('\n\n')
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
      router.push(tab === 'app' ? '/explore?submitted=true' : '/submit?mag=success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const isIntl = form.state_code === 'International'

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">

        {/* TAB SWITCHER */}
        <div className="bg-mthr-white border-b border-mthr-b1">
          <div className="flex px-7">
            {(['app', 'magazine'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-4 text-[9px] tracking-[0.16em] uppercase font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-mthr-black text-mthr-black'
                    : 'border-transparent text-mthr-mid hover:text-mthr-black'
                }`}>
                {t === 'app' ? 'App submission' : 'Magazine submission'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ── LEFT — SHARED + MAGAZINE FORM ── */}
          <div className="px-10 py-12 bg-mthr-white border-r border-mthr-b1">

            <h1 className="font-cormorant font-light text-[42px] leading-[1] text-mthr-black mb-1.5">
              {tab === 'app'
                ? <><span>Share your</span><br /><em>work.</em></>
                : <><span>Magazine</span><br /><em>submission.</em></>}
            </h1>
            <p className="text-[11px] text-mthr-mid leading-[1.7] mb-8 max-w-sm">
              {tab === 'app'
                ? 'Submit one featured image to appear on the MTHR explore feed and photographer community.'
                : 'Submit 10–20 print-ready JPG images for magazine consideration. Reviewed privately — never shown publicly on the app.'}
            </p>

            <div className="space-y-4">

              {/* TITLE */}
              <Field label="Title *">
                <input type="text"
                  placeholder={tab === 'app' ? 'e.g. The Andersons · Tuscany' : 'e.g. Luz · A Family in Oaxaca'}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mthr-input" />
              </Field>

              {/* LOCATION */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="City *">
                  <input type="text" placeholder="Denver" value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="mthr-input" />
                </Field>
                <Field label="State *">
                  <select value={form.state_code}
                    onChange={e => setForm(f => ({ ...f, state_code: e.target.value }))}
                    className="mthr-input">
                    <option value="">Select...</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {isIntl && (
                <Field label="Country *">
                  <input type="text" placeholder="Italy" value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    className="mthr-input" />
                </Field>
              )}

              {/* Location preview */}
              {form.city && form.state_code && (
                <div className="flex items-center gap-2 px-3 py-2 bg-mthr-off rounded-sm">
                  <span className="text-[9px] tracking-[0.12em] uppercase text-mthr-mid font-medium">Appears as:</span>
                  <span className="text-[13px] font-medium text-mthr-black">
                    {isIntl ? form.city : `${form.city}, ${form.state_code}`}
                  </span>
                  {!isIntl && (
                    <span className="text-[9px] text-mthr-dim ml-1">· under {form.state_code} tab</span>
                  )}
                </div>
              )}

              {/* WHO IS IN THE IMAGE */}
              <Field label="Who is in the image">
                <input type="text"
                  placeholder="e.g. The Johnson Family, Sarah & James, Baby Ellie"
                  value={form.subjects}
                  onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
                  className="mthr-input" />
              </Field>

              {/* INSTAGRAM */}
              <Field label="Your Instagram handle">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-mthr-mid">@</span>
                  <input type="text"
                    placeholder="yourhandle"
                    value={form.instagram}
                    onChange={e => setForm(f => ({ ...f, instagram: e.target.value.replace('@', '') }))}
                    className="mthr-input pl-7" />
                </div>
              </Field>

              {/* CATEGORY */}
              <Field label="Category">
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as SubmissionCategory }))}
                  className="mthr-input">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>

              {/* DESCRIPTION / ABOUT */}
              <Field label={tab === 'app' ? 'About this work' : 'About this work (optional)'}>
                <textarea
                  placeholder="Tell us about the session — the family, the place, what made it special..."
                  value={form.description} rows={3}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mthr-input resize-none leading-relaxed" />
              </Field>

              {/* ── MAGAZINE-ONLY FIELDS ── */}
              {tab === 'magazine' && (
                <>
                  <div className="border-t border-mthr-b1 pt-5 mt-2">
                    <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid font-medium mb-4">
                      Magazine details
                    </p>

                    {/* SUBMISSION STATEMENT */}
                    <Field label="Submission statement (optional)">
                      <textarea
                        placeholder="Share the story, emotion, or intention behind this work. This may be used alongside your spread in the magazine..."
                        value={magForm.submission_statement} rows={4}
                        onChange={e => setMagForm(f => ({ ...f, submission_statement: e.target.value }))}
                        className="mthr-input resize-none leading-relaxed" />
                    </Field>

                    {/* TEAM CREDITS */}
                    <div className="mt-4">
                      <Field label="Team credits (optional)">
                        <textarea
                          placeholder="e.g. Second shooter: Jane Smith · Styling: The Bloom Studio · Hair & makeup: Sarah Jones"
                          value={magForm.team_credits} rows={3}
                          onChange={e => setMagForm(f => ({ ...f, team_credits: e.target.value }))}
                          className="mthr-input resize-none leading-relaxed" />
                      </Field>
                    </div>

                    {/* COPYRIGHT DECLARATION */}
                    <div className="mt-5 p-4 border border-mthr-b2 rounded-sm bg-mthr-off">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative mt-0.5 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={magForm.copyright_declared}
                            onChange={e => setMagForm(f => ({ ...f, copyright_declared: e.target.checked }))}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-sm border transition-colors ${
                            magForm.copyright_declared
                              ? 'bg-mthr-black border-mthr-black'
                              : 'bg-mthr-white border-mthr-b2'
                          } flex items-center justify-center`}>
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
                            By checking this box I confirm that all images are original work, shot in JPG format with sRGB color profile, and that I have the right to license them for print publication in MTHR Magazine.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && (
              <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>
            )}

            {tab === 'magazine' && !magForm.copyright_declared && (
              <p className="mt-4 text-[10px] text-mthr-mid">
                * Copyright declaration required to submit.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={uploading || (tab === 'app' ? !canSubmitApp : !canSubmitMag)}
              className="w-full mt-6 py-3.5 bg-mthr-black text-mthr-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {uploading
                ? 'Submitting…'
                : tab === 'app'
                  ? 'Submit to MTHR →'
                  : 'Submit for magazine consideration →'}
            </button>
          </div>

          {/* ── RIGHT — IMAGE UPLOAD ── */}
          <div className="px-10 py-12 bg-mthr-off">

            {tab === 'app' ? (
              <>
                <h2 className="font-cormorant font-light text-[36px] leading-[1] text-mthr-black mb-6">
                  Your featured<br /><em>image.</em>
                </h2>

                <div onClick={() => appFileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) setAppFiles(Array.from(e.dataTransfer.files).slice(0, 10)) }}
                  className="border border-dashed border-mthr-b2 rounded-sm p-8 text-center cursor-pointer hover:bg-mthr-white hover:border-mthr-mid transition-all mb-8">
                  <div className="text-[24px] text-mthr-dim mb-2">+</div>
                  <div className="text-[10px] tracking-[0.1em] uppercase text-mthr-mid font-medium">
                    {appFiles.length > 0 ? `${appFiles.length} image${appFiles.length > 1 ? 's' : ''} selected (${appFiles.length}/10)` : 'Upload up to 10 images'}
                  </div>
                  <div className="font-cormorant italic text-[12px] text-mthr-dim mt-1">
                    JPG or PNG · Up to 10 images · Best work from the session
                  </div>
                  <input ref={appFileRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handleAppFile} />
                </div>

                <h3 className="font-cormorant font-light text-[22px] text-mthr-black mb-4">
                  App <em>guidelines</em>
                </h3>
                <Guidelines items={APP_GUIDELINES} />
              </>
            ) : (
              <>
                <h2 className="font-cormorant font-light text-[36px] leading-[1] text-mthr-black mb-3">
                  Print-ready<br /><em>images.</em>
                </h2>
                <p className="text-[11px] text-mthr-mid leading-[1.7] mb-6">
                  Upload 10–20 images. Each will be validated for print dimensions before upload.
                </p>

                <div onClick={() => magFileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  className="border border-dashed border-mthr-b2 rounded-sm p-8 text-center cursor-pointer hover:bg-mthr-white hover:border-mthr-mid transition-all mb-4">
                  <div className="text-[24px] text-mthr-dim mb-2">+</div>
                  <div className="text-[10px] tracking-[0.1em] uppercase text-mthr-mid font-medium">
                    {magFiles.length > 0
                      ? `${magFiles.length} image${magFiles.length > 1 ? 's' : ''} ready (${magFiles.length}/20)`
                      : 'Upload 10–20 print-ready JPG images'}
                  </div>
                  <div className="font-cormorant italic text-[12px] text-mthr-dim mt-1">
                    JPG · sRGB · Exact print dimensions required
                  </div>
                  <input ref={magFileRef} type="file" accept="image/jpeg" multiple className="hidden" onChange={handleMagFiles} />
                </div>

                {/* Rejected files */}
                {sizeErrors.length > 0 && (
                  <div className="mb-4 px-3 py-3 bg-red-50 rounded-sm border border-red-100">
                    <p className="text-[9px] tracking-[0.1em] uppercase text-red-600 font-medium mb-2">
                      {sizeErrors.length} image{sizeErrors.length > 1 ? 's' : ''} rejected:
                    </p>
                    {sizeErrors.map((e, i) => (
                      <p key={i} className="text-[11px] text-red-600 leading-[1.6]">{e}</p>
                    ))}
                  </div>
                )}

                {/* Accepted files */}
                {magFiles.length > 0 && (
                  <div className="mb-6 px-3 py-3 bg-white rounded-sm border border-mthr-b1">
                    <p className="text-[9px] tracking-[0.1em] uppercase text-mthr-mid font-medium mb-2">
                      Accepted ({magFiles.length}/20):
                    </p>
                    {magFiles.map((f, i) => (
                      <p key={i} className="text-[11px] text-mthr-black leading-[1.8]">{f.name}</p>
                    ))}
                  </div>
                )}

                <h3 className="font-cormorant font-light text-[22px] text-mthr-black mb-4">
                  Print <em>requirements</em>
                </h3>
                <Guidelines items={MAG_GUIDELINES} />
              </>
            )}
          </div>
        </div>

        {/* MAGAZINE SUCCESS STATE */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mag') === 'success' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-mthr-white rounded-sm p-10 max-w-sm text-center">
              <h2 className="font-cormorant font-light text-[32px] text-mthr-black mb-3">
                Thank you<br /><em>for submitting.</em>
              </h2>
              <p className="text-[12px] text-mthr-mid leading-[1.8]">
                Your magazine submission has been received. We review all submissions privately and will be in touch if your work is selected.
              </p>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function Guidelines({ items }: { items: { num: string; heading: string; text: string }[] }) {
  return (
    <div className="divide-y divide-mthr-b1">
      {items.map(g => (
        <div key={g.num} className="py-4">
          <div className="text-[9px] tracking-[0.1em] text-mthr-dim font-medium mb-1">{g.num}.</div>
          <div className="font-bebas text-[14px] tracking-[0.06em] text-mthr-black mb-1">{g.heading}</div>
          <div className="text-[11px] text-mthr-mid leading-[1.7]">{g.text}</div>
        </div>
      ))}
    </div>
  )
}

const APP_GUIDELINES = [
  { num: '01', heading: 'UP TO 10 IMAGES', text: 'Select up to 10 of your strongest images from the session.' },
  { num: '02', heading: 'HONEST IMAGERY', text: 'Natural light, real moments, genuine emotion. Let the story speak.' },
  { num: '03', heading: 'FAMILY PERMISSION', text: 'You must have written permission from families before sharing publicly.' },
  { num: '04', heading: 'TAG YOUR LOCATION', text: 'Include your city and state so your work appears in the correct location tab.' },
]

const MAG_GUIDELINES = [
  { num: '01', heading: 'JPG FORMAT ONLY', text: 'All images must be saved as JPG. No TIFF, PNG, or RAW files accepted.' },
  { num: '02', heading: 'sRGB COLOR PROFILE', text: 'Export with sRGB color profile. Do not submit Adobe RGB or CMYK files.' },
  { num: '03', heading: 'PORTRAIT — 2550 × 3300 px', text: '8.5 × 11 inches at 300dpi. For single-page portrait spreads.' },
  { num: '04', heading: 'LANDSCAPE — 5100 × 3300 px', text: '17 × 11 inches at 300dpi. For full double-page landscape spreads.' },
  { num: '05', heading: 'COPYRIGHT OWNER ONLY', text: 'You must be the original photographer and copyright holder of all submitted images.' },
  { num: '06', heading: '10–20 IMAGES', text: 'Minimum 10, maximum 20 images per submission. Curate your strongest work.' },
]
