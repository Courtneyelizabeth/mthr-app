'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'

// ── Magazine submission window ──────────────────────────────
const MAG_OPEN  = new Date('2026-04-01T00:00:00')
const MAG_CLOSE = new Date('2026-05-04T05:59:59')
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
  const [user, setUser] = useState<any>(undefined) // undefined = loading, null = logged out

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
  }, [])
  const [form, setForm] = useState({
    title: '',
    print_name: '',
    state_code: '',
    country: '',
    city: '',
    venue: '',
    category: 'motherhood',
    description: '',
    subjects: '',
    instagram: '',
  })
  const WEEKLY_QUESTIONS = [
    "in a few words, how do you create the feeling in your images — what do you look for, and how do you find it?",
    "how would you describe your process — what do you see or feel before you press the shutter?",
    "what do you believe makes your images feel the way they do — and how do you get there?",
    "describe your process in a few sentences — what do you look for and how do you capture it?",
  ]
  const weeklyQuestion = WEEKLY_QUESTIONS[new Date().getDay() % 4]

  const [magForm, setMagForm] = useState({
    submission_statement: '',
    team_credits: '',
    gallery_link: '',
    copyright_declared: false,
  })
  const [articleForm, setArticleForm] = useState({
    print_name: '', instagram: '', title: '', category: '', length: '', about: '', status: '', text: '', gallery_link: '', copyright_declared: false,
  })
  const ARTICLE_CATEGORIES = ['Photography craft','Motherhood & family','Business & community','Personal essay','Magazine & print','Other']
  const [processAnswer, setProcessAnswer] = useState('')
  const [appGalleryLink, setAppGalleryLink] = useState('')
  const [appFiles, setAppFiles] = useState<File[]>([])
  const [magFiles, setMagFiles] = useState<File[]>([])
  const [sizeErrors, setSizeErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const magOpen = isMagOpen()
  const isIntl = form.state_code === 'International'

  const handleAppFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAppFiles(Array.from(e.target.files).slice(0, 10))
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

  const canSubmitApp = appFiles.length > 0
  const canSubmitMag = form.title && magForm.gallery_link && magForm.copyright_declared

  const handleSubmit = async () => {
    setError(null)
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/submit'); return }

      let imageUrls: string[] = []
      if (tab === 'app') {
        if (appFiles.length === 0) { setError('Please select an image.'); setUploading(false); return }
        for (const file of appFiles) {
          const ext = file.name.split('.').pop()
          const path = `${user.id}/app/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { error: uploadError } = await supabase.storage.from('submissions').upload(path, file, { upsert: false })
          if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
          const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
          imageUrls.push(publicUrl)
        }
      } else {
        if (!magForm.gallery_link) { setError('Please add your gallery link.'); setUploading(false); return }
        imageUrls = [magForm.gallery_link]
      }

      const locationName = isIntl
        ? `${form.country || 'International'}${form.venue ? ` · ${form.venue}` : ''}`
        : `${form.state_code || 'USA'}${form.venue ? ` · ${form.venue}` : ''}`

      const fullDescription = tab === 'magazine'
        ? [form.description, magForm.submission_statement ? 'Statement: ' + magForm.submission_statement : '', magForm.team_credits ? 'Credits: ' + magForm.team_credits : ''].filter(Boolean).join('\n\n')
        : form.description

      const { error: insertError } = await (supabase.from('submissions') as any).insert({
        photographer_id: user.id,
        photographer_email: user.email ?? '',
        title: form.title,
        description: fullDescription,
        location_name: locationName,
        location_country: isIntl ? (form.country || 'International') : 'USA',
        location_state: form.state_code || null,
        location_state_code: form.state_code || null,
        category: form.category,
        submission_type: tab,
        images: imageUrls,
        cover_image: imageUrls[0] ?? null,
        subjects: form.subjects || null,
        instagram_handle: form.instagram || null,
        process_answer: tab === 'app' ? (processAnswer || null) : null,
        gallery_link: tab === 'app' ? (appGalleryLink || null) : (magForm.gallery_link || null),
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
            location: isIntl ? (form.country || 'International') : (form.state_code || 'USA'),
            gallery_link: tab === 'magazine' ? magForm.gallery_link : '',
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
            <p className="text-[12px] text-white/80">your account is your portfolio. every image you submit lives there.</p>
            <div className="flex gap-3 flex-shrink-0">
              <a href="/login" className="text-[10px] tracking-[0.14em] uppercase text-white/70 hover:text-white transition-colors">sign in</a>
              <a href="/signup" className="text-[10px] tracking-[0.14em] uppercase font-medium text-white border-b border-white/50 hover:border-white transition-colors">join free</a>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-0 mt-6 border-b border-[#E8E4DE]">
            <button
              onClick={() => { if (magOpen) setTab('magazine') }}
              className={`px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px relative ${
                tab === 'magazine' ? 'border-mthr-black text-mthr-black'
                : magOpen ? 'border-transparent text-mthr-dark hover:text-mthr-black'
                : 'border-transparent text-mthr-dim cursor-not-allowed'
              }`}>
              Print magazine
              {magOpen ? (
                <span className="ml-2 text-[8px] tracking-[0.08em] bg-mthr-black text-white px-1.5 py-0.5 rounded-full">Open</span>
              ) : (
                <span className="ml-2 text-[8px] tracking-[0.08em] bg-mthr-b1 text-mthr-mid px-1.5 py-0.5 rounded-full">Opens Apr 1</span>
              )}
            </button>
            <button onClick={() => setTab('app')}
              className={`px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px ${
                tab === 'app' ? 'border-mthr-black text-mthr-black' : 'border-transparent text-mthr-dark hover:text-mthr-black'
              }`}>
              Instagram & App
              <span className="ml-2 text-[8px] tracking-[0.08em] bg-mthr-black text-white px-1.5 py-0.5 rounded-full">Open</span>
            </button>
            <button onClick={() => setTab('article' as any)}
              className={`px-5 py-3 text-[10px] tracking-[0.14em] uppercase font-medium border-b-2 transition-colors -mb-px ${
                (tab as any) === 'article' ? 'border-mthr-black text-mthr-black' : 'border-transparent text-mthr-dark hover:text-mthr-black'
              }`}>
              Submit an article
              <span className="ml-2 text-[8px] tracking-[0.08em] bg-mthr-black text-white px-1.5 py-0.5 rounded-full">Open</span>
            </button>
          </div>
        </div>

        {/* Auth gate */}
        {user === null && (
          <div className="flex items-center justify-center px-8 py-20">
            <div className="text-center max-w-sm">
              <div className="w-16 h-[1px] bg-[#D0CCC6] mx-auto mb-8" />
              <h2 className="font-cormorant font-light text-[36px] leading-none text-mthr-black mb-3">
                sign in to <em>submit.</em>
              </h2>
              <p className="text-[12px] text-mthr-mid leading-[1.8] mb-8">
                you need a free MTHR account to submit your work. it takes 30 seconds.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a href="/signup" className="px-6 py-2.5 text-[10px] tracking-[0.16em] uppercase font-medium bg-mthr-black text-white rounded-full hover:bg-mthr-dark transition-colors">
                  join free →
                </a>
                <a href="/login?redirectTo=/submit" className="px-6 py-2.5 text-[10px] tracking-[0.16em] uppercase font-medium border border-mthr-b2 text-mthr-mid rounded-full hover:border-mthr-black hover:text-mthr-black transition-colors">
                  sign in
                </a>
              </div>
              <div className="w-16 h-[1px] bg-[#D0CCC6] mx-auto mt-8" />
            </div>
          </div>
        )}

        {user === undefined && (
          <div className="flex items-center justify-center px-8 py-20">
            <p className="text-[12px] text-mthr-mid">loading...</p>
          </div>
        )}

        {user !== null && user !== undefined && (
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

            {(tab as any) === 'article' && (
              <div className="space-y-4">
                <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid font-medium">Article submission</p>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Your name as you'd like to appear in print *</label>
                  <input type="text" placeholder="e.g. Courtney Maxwell" value={articleForm.print_name}
                    onChange={e => setArticleForm(f => ({ ...f, print_name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Your Instagram handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-mthr-mid">@</span>
                    <input type="text" placeholder="yourhandle" value={articleForm.instagram}
                      onChange={e => setArticleForm(f => ({ ...f, instagram: e.target.value.replace('@','') }))}
                      className="w-full pl-7 pr-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Article title *</label>
                  <input type="text" placeholder="working title is fine" value={articleForm.title}
                    onChange={e => setArticleForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Category *</label>
                  <select value={articleForm.category} onChange={e => setArticleForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors">
                    <option value="">Select a category...</option>
                    {ARTICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Length *</label>
                  <select value={articleForm.length} onChange={e => setArticleForm(f => ({ ...f, length: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors">
                    <option value="">Select...</option>
                    <option value="short_read">Short read — 300 to 500 words</option>
                    <option value="feature">Feature — 500 to 1000 words</option>
                    <option value="long_form">Long form — 1000 words and over</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">What's your article about? *</label>
                  <textarea placeholder="a few sentences is fine — we just want to feel the idea before we read it." value={articleForm.about} rows={3}
                    onChange={e => setArticleForm(f => ({ ...f, about: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors resize-none leading-relaxed" />
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Ready to submit or pitching? *</label>
                  <select value={articleForm.status} onChange={e => setArticleForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors">
                    <option value="">Select...</option>
                    <option value="ready">Ready to submit</option>
                    <option value="pitch">Pitching the idea first</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Your article or pitch *</label>
                  <textarea placeholder="paste your article text or pitch directly here." value={articleForm.text} rows={8}
                    onChange={e => setArticleForm(f => ({ ...f, text: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors resize-none leading-relaxed" />
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">Gallery or portfolio link (optional)</label>
                  <input type="url" placeholder="your portfolio or a gallery of supporting images" value={articleForm.gallery_link}
                    onChange={e => setArticleForm(f => ({ ...f, gallery_link: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-4 border border-[#D0CCC6] rounded-sm bg-[#F5F2EE]">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" checked={articleForm.copyright_declared}
                      onChange={e => setArticleForm(f => ({ ...f, copyright_declared: e.target.checked }))}
                      className="sr-only" />
                    <div className={`w-4 h-4 rounded-sm border transition-colors flex items-center justify-center ${articleForm.copyright_declared ? 'bg-mthr-black border-mthr-black' : 'bg-white border-[#D0CCC6]'}`}>
                      {articleForm.copyright_declared && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-mthr-black leading-[1.5]">I confirm this is my original work and I hold all rights to it *</p>
                    <p className="text-[10px] text-mthr-mid leading-[1.6] mt-1">by submitting you give MTHR permission to publish your work on the platform and consider it for the print magazine. full credit will always be given.</p>
                  </div>
                </label>

                {error && <p className="text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}
                <button onClick={async () => {
                  if (!articleForm.title || !articleForm.category || !articleForm.length || !articleForm.text || !articleForm.copyright_declared) {
                    setError('please fill in all required fields.'); return
                  }
                  setError(null); setUploading(true)
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) { router.push('/login?redirectTo=/submit'); return }
                    const articleDesc = [
                      articleForm.about ? `About: ${articleForm.about}` : '',
                      articleForm.status ? `Status: ${articleForm.status}` : '',
                      '\n\n' + articleForm.text,
                    ].filter(Boolean).join('\n')
                    const { error: insertError } = await (supabase.from('submissions') as any).insert({
                      photographer_id: user.id,
                      photographer_email: user.email ?? '',
                      title: articleForm.title,
                      description: articleDesc,
                      location_name: '',
                      location_country: '',
                      category: 'other',
                      submission_type: 'article',
                      images: [],
                      cover_image: null,
                      subjects: `Category: ${articleForm.category} | Length: ${articleForm.length}`,
                      instagram_handle: articleForm.instagram || null,
                      process_answer: `Name in print: ${articleForm.print_name}`,
                      gallery_link: articleForm.gallery_link || null,
                    })
                    if (insertError) throw new Error(insertError.message)
                    try {
                      await fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'submission_received',
                          photographer_name: user?.user_metadata?.full_name ?? 'Writer',
                          photographer_email: user?.email || '',
                          submission_title: `[Article] ${articleForm.title}`,
                          location: '—',
                          gallery_link: '',
                        }),
                      })
                    } catch (e) { console.error('Email error:', e) }
                    router.push('/submit/thank-you')
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Something went wrong')
                  } finally { setUploading(false) }
                }} disabled={uploading}
                  className="w-full py-3.5 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {uploading ? 'submitting…' : 'submit your article →'}
                </button>
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
                  <Field label="Your name as you'd like to appear in print (optional)">
                    <input type="text" placeholder="e.g. Courtney Maxwell" value={form.print_name ?? ''}
                      onChange={e => setForm(f => ({ ...f, print_name: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </Field>
                )}
                {tab === 'magazine' && (
                  <Field label="Title *">
                    <input type="text" placeholder="e.g. Luz - A Family in Oaxaca"
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </Field>
                )}

                {tab === 'app' && (
                  <Field label="City (optional)">
                    <input type="text" placeholder="e.g. Denver" value={form.city ?? ''}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                  </Field>
                )}
                {(tab as any) === 'article' && null}

                <Field label="State (optional)">
                  <select value={form.state_code} onChange={e => setForm(f => ({ ...f, state_code: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors">
                    <option value="">Select...</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="Country (optional)">
                  <input type="text" placeholder="e.g. Australia" value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                </Field>

                <Field label="Venue or park name (optional)">
                  <input type="text" placeholder="e.g. Rocky Mountain National Park"
                    value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                </Field>

                {/* Location preview */}
                {form.state_code && (
                  <div className="px-3 py-2 bg-[#F5F2EE] rounded-sm border border-[#E8E4DE]">
                    <span className="text-[9px] tracking-[0.12em] uppercase text-mthr-mid font-medium">appears as: </span>
                    <span className="text-[13px] text-mthr-black">
                      {isIntl ? (form.country || 'International') : form.state_code}{form.venue ? ` · ${form.venue}` : ''}
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

                {tab === 'app' && (
                  <Field label="how it happened (optional)">
                    <textarea placeholder="what part of your client experience made this possible? how do you create the conditions for real moments to unfold?

walk us through your process. what were you watching for, and what created the conditions for this moment? what do you wish you'd known earlier that changed how you work?"
                      value={form.description} rows={4}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors resize-none leading-relaxed" />
                  </Field>
                )}

                {tab === 'app' && (
                  <div className="border-t border-[#E8E4DE] pt-5 space-y-4">
                    <Field label={<span>{weeklyQuestion} <span className="text-mthr-dim normal-case">(optional)</span></span>}>
                      <textarea placeholder="share as much or as little as you like..." value={processAnswer} rows={3}
                        onChange={e => setProcessAnswer(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors resize-none leading-relaxed" />
                    </Field>
                  </div>
                )}

                {/* Magazine extra fields */}
                {tab === 'magazine' && magOpen && (
                  <div className="border-t border-[#E8E4DE] pt-5 space-y-4">
                    <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-mid font-medium">Magazine details</p>

                    <Field label="Gallery link *">
                    <input type="url" placeholder="pixieset.com/yourgallery or dropbox.com/..."
                      value={magForm.gallery_link}
                      onChange={e => setMagForm(f => ({ ...f, gallery_link: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#F5F2EE] border border-[#D0CCC6] text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors" />
                    <p className="text-[11px] text-mthr-mid mt-1 leading-[1.6]">share a link to your full gallery — pic-time, pixieset, or similar. make sure your gallery is set to <strong>public</strong> and high res images have <strong>downloads enabled</strong>.</p>
                  </Field>

                  <Field label="in your own words (optional)">
                      <textarea placeholder="we want to know how you think, how you see, what you feel before you press the shutter. tell us about your process in a way that only you can."
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

                {(tab as any) !== 'article' && (
                  <>
                    {error && <p className="text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>}
                    <button onClick={handleSubmit}
                      disabled={uploading || (tab === 'app' ? !canSubmitApp : !canSubmitMag)}
                      className="w-full py-3.5 bg-mthr-black text-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {uploading ? 'submitting…' : tab === 'app' ? 'submit for instagram & app →' : 'submit for magazine consideration →'}
                    </button>
                  </>
                )}
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
                <p className="text-[11px] text-mthr-mid mb-2">submit as many images as you like. up to 10 per submission.</p>
                <p className="text-[11px] text-mthr-mid mb-6 font-medium">the first image is what will be featured on the MTHR feed — choose a strong one.</p>

                <div onClick={() => appFileRef.current?.click()} onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) setAppFiles(Array.from(e.dataTransfer.files).slice(0, 10)) }}
                  className="border border-dashed border-[#D0CCC6] rounded-sm p-8 text-center cursor-pointer hover:bg-white hover:border-mthr-mid transition-all mb-8">
                  <div className="text-[24px] text-mthr-dim mb-2">+</div>
                  <div className="text-[10px] tracking-[0.1em] uppercase text-mthr-mid font-medium">
                    {appFiles.length > 0 ? `${appFiles.length} image${appFiles.length > 1 ? 's' : ''} selected (${appFiles.length}/10)` : 'drag & drop or click to upload'}
                  </div>
                  <div className="font-cormorant italic text-[12px] text-mthr-dim mt-1">jpg or png · up to 10 images · high resolution preferred</div>
                  <input ref={appFileRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handleAppFiles} />
                </div>

                {appFiles.length > 0 && (
                  <div className="grid grid-cols-5 gap-1.5 mb-8">
                    {appFiles.map((file, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview ${i + 1}`}
                          className="w-full h-full object-cover rounded-sm"
                        />
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-mthr-black/70 py-0.5 text-center">
                            <span className="text-[8px] tracking-[0.08em] uppercase text-white/80">cover</span>
                          </div>
                        )}
                        <button
                          onClick={() => setAppFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full text-[10px] text-mthr-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center leading-none hover:bg-white"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="font-cormorant font-light text-[20px] text-mthr-black mb-4">guidelines.</h3>
                <div className="divide-y divide-[#E8E4DE]">
                  {[
                    { n: '01', h: 'your best work.', t: 'up to 10 images per submission. your first image is what appears on the MTHR feed — make it count.' },
                    { n: '02', h: 'your work, your rights.', t: 'submission confirms you hold full copyright for every image you share.' },
                    { n: '03', h: 'no limit.', t: 'submit as many images as you like. up to 10 per submission.' },
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
                <p className="text-[11px] text-mthr-mid mb-6">share your images via a gallery link. no file uploads required.</p>

                <div className="px-4 py-5 border border-[#D0CCC6] rounded-sm mb-8 space-y-2">
                  <p className="text-[10px] tracking-[0.14em] uppercase font-medium text-mthr-black">accepted gallery types</p>
                  {['Pic-Time *or similar', 'Pixieset *or similar', 'WeTransfer'].map(s => (
                    <p key={s} className="text-[12px] text-mthr-mid">· {s}</p>
                  ))}
                  <p className="text-[10px] text-mthr-mid pt-2 border-t border-[#E8E4DE] leading-[1.7]">
                    ⚠ your gallery must be set to <strong>public</strong> and high res images must have <strong>downloads enabled</strong>.
                  </p>
                </div>

                <h3 className="font-cormorant font-light text-[20px] text-mthr-black mb-4">print requirements.</h3>
                <div className="divide-y divide-[#E8E4DE]">
                  {[
                    { n: '01', h: 'your favorite work.', t: 'the image(s) that stopped you. the one(s) you come back to.' },
                    { n: '02', h: 'sRGB color profile', t: 'export with sRGB. do not submit Adobe RGB or CMYK.' },
                    { n: '03', h: 'portrait — 2550 × 3300px', t: '8.5 × 11 inches at 300dpi. single-page portrait spreads.' },
                    { n: '04', h: 'landscape — 5100 × 3300px', t: '17 × 11 inches at 300dpi. full double-page spreads.' },
                    { n: '05', h: 'copyright owner only', t: 'you must be the original photographer and copyright holder.' },
                    { n: '06', h: '1–20 images', t: 'minimum 1, maximum 20 images per submission.' },
                  ].map(g => (
                    <div key={g.n} className="py-3.5">
                      <div className="text-[9px] tracking-[0.1em] text-mthr-dim mb-0.5">{g.n}.</div>
                      <div className="text-[11px] font-medium text-mthr-black uppercase tracking-[0.06em] mb-0.5">{g.h}</div>
                      <div className="text-[11px] text-mthr-mid leading-[1.6]">{g.t}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 border-t border-[#E8E4DE] pt-6 space-y-5">
                  <h3 className="font-cormorant font-light text-[20px] text-mthr-black">questions.</h3>
                  {[
                    { q: 'how many images can i submit?', a: 'each submission can include between 1 and 20 images. there is no limit to how many times you can submit — so if you have more work to share, simply submit again.' },
                    { q: 'do my images need to be from one session?', a: 'not at all. your submission can be a collection of favorites from across multiple sessions, a full series from one session, or a mix of both. there are no rules here — just bring your best work.' },
                    { q: 'what are we looking for?', a: 'images that feel real, intentional and true to the MTHR world. motherhood, maternity, kids and family — captured with care.' },
                    { q: 'full credit always.', a: 'your name and handle will always be credited with your work. always.' },
                    { q: 'what happens after i submit?', a: 'magazine submissions are considered for the MTHR print magazine only. selected photographers will be notified and their work featured in a tangible, printed edition that does justice to the craft.' },
                  ].map(({ q, a }) => (
                    <div key={q} className="border-b border-[#E8E4DE] pb-4">
                      <p className="text-[11px] font-medium text-mthr-black uppercase tracking-[0.06em] mb-1">{q}</p>
                      <p className="text-[11px] text-mthr-mid leading-[1.7]">{a}</p>
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
                  the magazine submission window opens april 1 — may 3, 2026.<br />
                  in the meantime, submit your work to the app feature.
                </p>
              </div>
            )}

            {(tab as any) === 'article' && (
              <>
                <h2 className="font-cormorant font-light text-[32px] leading-none text-mthr-black mb-2">your <em>article.</em></h2>
                <p className="text-[11px] text-mthr-mid mb-8">we're looking for writers who live inside this world. if you've got something to say, we want to read it.</p>
                <h3 className="font-cormorant font-light text-[20px] text-mthr-black mb-4">a few things to know.</h3>
                <div className="divide-y divide-[#E8E4DE]">
                  {[
                    { n: '01', h: 'write like MTHR.', t: "articles should feel warm, intentional, honest and written from real experience. we're not looking for perfection. we're looking for truth." },
                    { n: '02', h: 'full credit always.', t: 'your name, handle and location will appear with your published piece.' },
                    { n: '03', h: 'where it goes.', t: 'selected articles will be featured on the MTHR platform and considered for the print magazine.' },
                    { n: '04', h: 'submissions open.', t: 'submissions are open alongside photography submissions through may 3rd.' },
                  ].map(g => (
                    <div key={g.n} className="py-3.5">
                      <div className="text-[9px] tracking-[0.1em] text-mthr-dim mb-0.5">{g.n}.</div>
                      <div className="text-[11px] font-medium text-mthr-black uppercase tracking-[0.06em] mb-0.5">{g.h}</div>
                      <div className="text-[11px] text-mthr-mid leading-[1.6]">{g.t}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function Field({ label, children }: { label: string | React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">{label}</label>
      {children}
    </div>
  )
}
