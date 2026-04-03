import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-mthr-b1 bg-mthr-white">
      <div className="flex items-center justify-between px-7 py-6">
        <div>
          <span className="font-barlow font-bold text-[24px] tracking-[-0.08em] uppercase text-mthr-black">MTHR</span>
          <p className="text-[10px] tracking-[0.14em] uppercase text-mthr-mid mt-1">
            Where real life is the story.
          </p>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: 'Explore', href: '/explore' },
            { label: 'Magazine', href: '/magazine' },
            { label: 'Community', href: '/community' },
            { label: 'Locations', href: '/location-guide' },
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
    </footer>
  )
}