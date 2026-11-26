'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

const MAGCLOUD = 'https://www.magcloud.com/browse/issue/3445022?__r=8718597'

export default function ReaderClient({ vol, count, title, freePages }: { vol: string; count: number; title: string; freePages: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const [wide, setWide] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const f = () => setWide(mq.matches)
    f()
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])

  useEffect(() => {
    ref.current?.scrollTo({ left: 0 })
    setIdx(0)
  }, [wide])

  const shown = Math.min(count, freePages)
  const slides = useMemo(() => {
    if (!wide) return Array.from({ length: shown }, (_, i) => [i + 1])
    const out: number[][] = [[1]]
    const lastAlone = shown === count && shown > 1
    const end = lastAlone ? shown - 1 : shown
    for (let i = 2; i <= end; i += 2) out.push(i + 1 <= end ? [i, i + 1] : [i])
    if (lastAlone) out.push([shown])
    return out
  }, [shown, count, wide])
  const total = slides.length + 1 // end card

  const go = useCallback((d: number) => {
    const el = ref.current
    if (el) el.scrollBy({ left: d * el.clientWidth, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const cur = slides[Math.min(idx, slides.length - 1)]
  const label = cur.length === 2 ? `${cur[0]}–${cur[1]}` : `${cur[0]}`

  return (
    <div className="bg-[#F2F0EC] text-mthr-black" style={{ height: '100dvh' }}>
      <div className="flex items-center justify-between px-5 h-12 border-b border-[#E8E4DE]">
        <Link href="/read" className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black">← all issues</Link>
        <span className="text-[10px] tracking-[0.14em] uppercase">{title}</span>
        <span className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid">{label} / {shown}</span>
      </div>
      <div className="relative" style={{ height: 'calc(100dvh - 48px)' }}>
        <div
          ref={ref}
          onScroll={e => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex h-full overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {slides.map((pages, i) => (
            <div key={i} className="flex-none w-full h-full snap-center flex items-center justify-center p-2 md:p-4">
              {pages.map(n => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={n} src={`/reader/${vol}/${String(n).padStart(3, '0')}.jpg`} alt={`${title} page ${n}`} loading={i < 2 ? 'eager' : 'lazy'} className={`max-h-full object-contain ${wide ? 'max-w-[50%]' : 'max-w-full'}`} />
              ))}
            </div>
          ))}
          <div className="flex-none w-full h-full snap-center flex flex-col items-center justify-center text-center px-8">
            <p className="font-cormorant font-light text-[34px] leading-tight">thank you for <em>reading.</em></p>
            <p className="text-[12px] text-mthr-mid mt-3 max-w-[320px]">hold the printed magazine in your hands.</p>
            <a href={MAGCLOUD} target="_blank" rel="noopener noreferrer" className="mt-6 px-6 py-3 bg-mthr-black text-white text-[10px] tracking-[0.14em] uppercase rounded-full">order a print →</a>
          </div>
        </div>
        {idx > 0 && <button onClick={() => go(-1)} aria-label="previous" className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 text-[28px] text-mthr-mid hover:text-mthr-black px-3">‹</button>}
        {idx < total - 1 && <button onClick={() => go(1)} aria-label="next" className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[28px] text-mthr-mid hover:text-mthr-black px-3">›</button>}
      </div>
    </div>
  )
}
