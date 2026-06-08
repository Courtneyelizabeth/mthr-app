import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-mthr-b1 bg-mthr-white">
      <div className="px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="font-cormorant font-light text-[24px] leading-none text-mthr-black tracking-[-0.02em]">MTHR<span className="text-[18px]">.</span></span>
          <p className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid mt-1">
            Where real life is the story.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {[
            { label: 'Explore', href: '/explore' },
            { label: 'Magazine', href: '/magazine' },
            { label: 'Community', href: '/community' },
            { label: 'Shoot Guides', href: '/location-guide' },
            { label: 'Submit', href: '/submit' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[9px] tracking-[0.14em] uppercase text-mthr-mid hover:text-mthr-black transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="text-[9px] tracking-[0.1em] text-mthr-dim">
          © {new Date().getFullYear()} MTHR Magazine
        </p>
      </div>
      <div className="border-t border-[#E8E4DE] mt-8 pt-6 px-6 pb-6 flex gap-6">
    <a href="/privacy" className="text-[9px] tracking-[0.12em] uppercase text-mthr-dim hover:text-mthr-black transition-colors">privacy policy</a>
    <a href="/terms" className="text-[9px] tracking-[0.12em] uppercase text-mthr-dim hover:text-mthr-black transition-colors">terms of use</a>
  </div>
</footer>
  )
}