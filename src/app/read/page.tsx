import Link from 'next/link'

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
    </div>
  )
}
