'use client'
import { useEffect } from 'react'
import { track } from '@vercel/analytics'

export default function AnalyticsEvents() {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      const href = a.getAttribute('href') || ''
      const from = window.location.pathname
      if (href.includes('magcloud')) track('order_print_click', { from })
      else if (href.startsWith('/read/')) track('open_reader', { vol: href.split('/')[2], from })
      else if (href === '/read') track('read_free_click', { from })
    }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])
  return null
}
