'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import type { SubmissionCategory } from '@/types/database'

const CATEGORIES: { value: SubmissionCategory; label: string }[] = [
  { value: 'family_documentary', label: 'Family documentary' },
  { value: 'motherhood', label: 'Motherhood' },
  { value: 'fatherhood', label: 'Fatherhood' },
  { value: 'newborn', label: 'Newborn' },
  { value: 'love_couples', label: 'Love & couples' },
  { value: 'editorial', label: 'Editorial' },
]

export default function SubmitPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    location_name: '',
    location_country: '',
    category: 'family_documentary' as SubmissionCategory,
    description: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files))
  }

  const handleSubmit = async () => {
    setError(null)
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/submit'); return }

      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(path, file, { upsert: false })
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      // Insert submission row
      const { error: insertError } = await supabase.from('submissions').insert({
        photographer_id: user.id,
        title: form.title,
        description: form.description,
        location_name: form.location_name,
        location_country: form.location_country,
        category: form.category,
        images: imageUrls,
        cover_image: imageUrls[0] ?? null,
      })

      if (insertError) throw new Error(insertError.message)
      router.push('/explore?submitted=true')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2">

        {/* LEFT — FORM */}
        <div className="px-10 py-12 bg-mthr-white border-r border-mthr-b1">
          <h1 className="font-cormorant font-light text-[42px] leading-[1] text-mthr-black mb-1.5">
            Share your<br /><em>work.</em>
          </h1>
          <p className="text-[11px] text-mthr-mid leading-[1.7] mb-8 max-w-sm">
            Submit your documentary family photography to be featured in MTHR Magazine and the app.
          </p>

          <div className="space-y-4">
            <Field label="Session title">
              <input
                type="text"
                placeholder="e.g. The Andersons · Tuscany"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City / Region">
                <input
                  type="text"
                  placeholder="Tuscany"
                  value={form.location_name}
                  onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
                />
              </Field>
              <Field label="Country">
                <input
                  type="text"
                  placeholder="Italy"
                  value={form.location_country}
                  onChange={e => setForm(f => ({ ...f, location_country: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
                />
              </Field>
            </div>

            <Field label="Category">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as SubmissionCategory }))}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>

            <Field label="About this work">
              <textarea
                placeholder="Tell us about the session — the family, the place, what made it special..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2.5 bg-mthr-white border border-mthr-b2 text-[13px] text-mthr-black rounded-sm outline-none focus:border-mthr-black transition-colors font-dm resize-none leading-relaxed"
              />
            </Field>
          </div>

          {error && (
            <p className="mt-4 text-[11px] text-red-600 bg-red-50 px-3 py-2 rounded-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={uploading || !form.title || !form.location_name || !form.location_country}
            className="w-full mt-6 py-3.5 bg-mthr-black text-mthr-white text-[10px] tracking-[0.18em] uppercase font-medium rounded-sm hover:bg-mthr-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? 'Submitting…' : 'Submit for consideration →'}
          </button>
        </div>

        {/* RIGHT — UPLOAD + GUIDELINES */}
        <div className="px-10 py-12 bg-mthr-off">
          <h2 className="font-cormorant font-light text-[36px] leading-[1] text-mthr-black mb-6">
            Upload your<br /><em>images.</em>
          </h2>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="border border-dashed border-mthr-b2 rounded-sm p-8 text-center cursor-pointer hover:bg-mthr-white hover:border-mthr-mid transition-all mb-8"
          >
            <div className="text-[24px] text-mthr-dim mb-2">+</div>
            <div className="text-[10px] tracking-[0.1em] uppercase text-mthr-mid font-medium">
              {files.length > 0 ? `${files.length} image${files.length > 1 ? 's' : ''} selected` : 'Drag images here or click to browse'}
            </div>
            <div className="font-cormorant italic text-[12px] text-mthr-dim mt-1">
              JPG or TIFF · Up to 50MB per image · Max 20 images
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/tiff,image/png"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </div>

          {/* Guidelines */}
          <h3 className="font-cormorant font-light text-[22px] text-mthr-black mb-4">
            Submission <em>guidelines</em>
          </h3>
          <div className="divide-y divide-mthr-b1">
            {GUIDELINES.map(g => (
              <div key={g.num} className="py-4">
                <div className="text-[9px] tracking-[0.1em] text-mthr-dim font-medium mb-1">{g.num}.</div>
                <div className="font-bebas text-[14px] tracking-[0.06em] text-mthr-black mb-1">{g.heading}</div>
                <div className="text-[11px] text-mthr-mid leading-[1.7]">{g.text}</div>
              </div>
            ))}
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
      <label className="block text-[9px] tracking-[0.16em] uppercase font-medium text-mthr-mid mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const GUIDELINES = [
  { num: '01', heading: 'DOCUMENTARY ONLY', text: 'We feature honest, unposed imagery. Natural light, real moments, genuine emotion.' },
  { num: '02', heading: 'HIGH RESOLUTION', text: 'Minimum 2000px on the long edge for digital. 4000px+ for print consideration.' },
  { num: '03', heading: 'FAMILY PERMISSION', text: 'You must have written permission from families to share their images publicly.' },
  { num: '04', heading: 'LOCATION DETAILS', text: 'Include the specific location to help us build the places map for the community.' },
]
