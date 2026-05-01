'use client'
import { useState } from 'react'

export default function CopyProfileButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy}
      className="text-[9px] tracking-[0.14em] uppercase font-medium px-4 py-2 border border-[#D0CCC6] text-mthr-mid hover:border-mthr-black hover:text-mthr-black transition-colors rounded-sm">
      {copied ? 'copied ✓' : 'copy profile link'}
    </button>
  )
}
