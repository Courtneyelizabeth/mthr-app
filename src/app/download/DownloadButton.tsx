'use client'
import { useState } from 'react'

export default function DownloadButton({ sessionId, file }: { sessionId: string; file: string }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setMsg('')
          try {
            const r = await fetch('/api/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId, file }),
              cache: 'no-store',
            })
            const j = await r.json()
            if (j.url) window.location.href = j.url
            else setMsg(j.error ?? 'something went wrong. please try again.')
          } catch {
            setMsg('something went wrong. please try again.')
          }
          setBusy(false)
        }}
        className="px-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.14em] uppercase rounded-full disabled:opacity-40"
      >
        {busy ? '...' : `download volume ${file.replace('vol', '')} (pdf) ↓`}
      </button>
      {msg && <p className="text-[11px] text-mthr-mid">{msg}</p>}
    </div>
  )
}
