import Link from 'next/link'
import BuyButton from './BuyButton'

const DL = process.env.NEXT_PUBLIC_DOWNLOADS_ENABLED === 'true'

const ISSUES = [
  { vol: 'vol1', label: 'volume 1' },
  { vol: 'vol2', label: 'volume 2' },
]

export default function ReadIndex() {
  return (
    <div className="px-8 pt-10 pb-20 max-w-[900px] mx-auto">
      <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black">read <em>the magazine.</em></h1>
      <p className="text-[12px] text-mthr-mid mt-3">the golden season · edition three. free to read, swipe through every page.</p>
      <div className="grid grid-cols-2 gap-6 mt-10">
        {ISSUES.map(i => (
          <Link key={i.vol} href={`/read/${i.vol}`} className="group block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/reader/${i.vol}/001.jpg`} alt={i.label} className="w-full shadow-sm group-hover:opacity-90 transition-opacity" />
            <p className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid mt-3">{i.label} · read free →</p>
          </Link>
        ))}
      </div>
      {DL && (
        <div className="mt-10 flex flex-wrap gap-3 items-center">
          <BuyButton item="vol1" label="download vol 1 · $9.99" />
          <BuyButton item="vol2" label="download vol 2 · $9.99" />
          <BuyButton item="bundle" label="both volumes · $15" />
        </div>
      )}
    </div>
  )
}
