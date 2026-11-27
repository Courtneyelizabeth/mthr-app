'use client'
import { track } from '@vercel/analytics'
import { useState } from 'react'

export default function BuyButton({ item, label }: { item: string; label: string }) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          track('checkout_started', { item })
          const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item }) })
          const { url } = await r.json()
          if (url) window.location.href = url
          else setBusy(false)
        } catch { setBusy(false) }
      }}
      className="px-6 py-3 border border-mthr-black text-mthr-black text-[10px] tracking-[0.14em] uppercase rounded-full hover:bg-mthr-black hover:text-white transition-colors disabled:opacity-40"
    >
      {busy ? '...' : label}
    </button>
  )
}
