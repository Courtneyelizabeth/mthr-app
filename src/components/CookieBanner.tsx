'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('mthr-cookie-consent')
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('mthr-cookie-consent', 'accepted')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('mthr-cookie-consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-mthr-black text-white px-6 py-4 md:flex md:items-center md:justify-between gap-6">
      <p className="text-[11px] text-white/70 leading-[1.7] mb-3 md:mb-0 max-w-2xl">
        we use essential cookies to keep you signed in and the site running. we don't use advertising or tracking cookies.{' '}
        <a href="/privacy" className="text-white underline hover:text-white/80 transition-colors">learn more</a>
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={decline}
          className="text-[9px] tracking-[0.14em] uppercase font-medium px-4 py-2 border border-white/30 text-white/60 hover:border-white/60 hover:text-white transition-colors rounded-sm"
        >
          decline
        </button>
        <button
          onClick={accept}
          className="text-[9px] tracking-[0.14em] uppercase font-medium px-4 py-2 bg-white text-mthr-black hover:bg-white/90 transition-colors rounded-sm"
        >
          accept
        </button>
      </div>
    </div>
  )
}
