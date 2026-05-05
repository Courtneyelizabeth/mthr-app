import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function MagazinePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1">

        {/* ── MAGAZINE SUBMISSIONS BANNER — TOP ── */}
        <section className="bg-mthr-black text-white px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">coming soon</p>
            <p className="font-cormorant italic font-light text-[13px] text-white/50 mb-3">summer print magazine 2026 — submissions open june 10th</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/50 mb-1">next submission window</p>
            <p className="font-cormorant italic font-light text-[24px]">June 10 — July 12, 2026</p>
          </div>
          <Link
            href="/submit"
            className="text-[10px] tracking-[0.16em] uppercase font-medium px-6 py-2.5 border border-white/50 text-white hover:bg-white hover:text-mthr-black transition-colors rounded-sm flex-shrink-0"
          >
            Submit your work →
          </Link>
        </section>

        {/* ── LETTER FROM THE FOUNDER ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 min-h-[90vh] border-b border-[#E8E4DE]">
          {/* Left — photo placeholder */}
          <div className="relative min-h-[50vh] md:min-h-full overflow-hidden">
            <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/katiemitzphoto-170.jpg" alt="Courtney Maxwell" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Right — letter */}
          <div className="px-10 md:px-16 py-16 flex flex-col justify-center">
            <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-1">Welcome</p>
            <p className="text-[9px] tracking-[0.16em] uppercase text-mthr-dim mb-6">A letter from the founder</p>
            <hr className="border-[#E8E4DE] mb-10" />

            <h2 className="font-cormorant italic font-light text-[34px] leading-[1.15] text-mthr-black mb-8">
              welcome to MTHR.
            </h2>

            <div className="space-y-5 font-cormorant font-light text-[17px] leading-[1.85] text-mthr-dark">
              <p>somewhere between the golden hour and the ordinary tuesday, there are photographs being made that will outlast all of us.</p>
              <p>i started MTHR because those photographs deserve more than a scroll. <em>they deserve a community. a platform. a printed page.</em></p>
              <p>i'm courtney — a photographer, a mother, and someone who has always believed that the most important images are the ones made closest to home.</p>
              <p>this platform was built for the photographers who feel that too. who know that what they do isn't just a job — it's an act of preservation. of love. of bearing witness to the most fleeting, extraordinary thing there is: a family, alive in a moment, never to be exactly this way again.</p>
              <p>submit your work. join the community. let your images live somewhere they belong.</p>
              <p className="font-cormorant italic text-[19px]">MTHR is yours.</p>
              <div className="pt-2">
                <p className="text-[13px] text-mthr-black font-normal">courtney</p>
                <a
                  href="https://instagram.com/courtneymaxwellphotography"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] tracking-[0.08em] text-mthr-mid hover:text-mthr-black transition-colors"
                >
                  @courtneymaxwellphotography
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── APPROACH ── */}
        <section className="border-b border-[#E8E4DE]">
          {/* Heading */}
          <div className="text-center px-8 pt-16 pb-12 border-b border-[#E8E4DE]">
            <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-4">Approach</p>
            <h2 className="font-cormorant italic font-light text-[52px] md:text-[68px] leading-[1.05] text-mthr-black mb-5">
              how we see<br />the world.
            </h2>
            <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium">
              Family photography as art. as witness. as something that lasts.
            </p>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
            {/* Left — photo placeholder */}
            <div className="relative min-h-[40vh] md:min-h-full overflow-hidden">
            <img src="https://zhqzwfgqpgnhghkvwcwt.supabase.co/storage/v1/object/public/magazine/courtney_maxwell_photography58_websize-4.jpg" alt="How we see the world" className="absolute inset-0 w-full h-full object-cover" />
          </div>

            {/* Right — text */}
            <div className="px-10 md:px-16 py-14 flex flex-col justify-center">
              <p className="text-[9px] tracking-[0.18em] uppercase text-mthr-mid font-medium mb-6">The MTHR belief</p>
              <hr className="border-[#E8E4DE] mb-10" />

              <div className="space-y-5 font-cormorant font-light text-[17px] leading-[1.85] text-mthr-dark">
                <p>we believe family photography is one of the most important things a person can do with a camera.</p>
                <p>not because of the technical skill it requires. not because of the equipment or the editing or the perfectly timed light.</p>
                <p>because of what it does.</p>
                <p>it witnesses a life. it says — this family existed. this child was small once. this love was real and present and here.</p>
                <p>the photographers who do this work understand something most people don't. that a frame is never just a frame. it's a record. a gift. something that will be looked at long after the moment it was made.</p>
                <p className="font-cormorant italic text-[20px] leading-[1.4] text-mthr-black">
                  MTHR was built to honour that. to give that work the home it deserves.
                </p>
              </div>
            </div>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#E8E4DE]">
            {[
              {
                num: '01',
                title: 'witness',
                body: 'we celebrate photographers who see — really see — the families in front of them. who bear witness to the real and the beautiful.'
              },
              {
                num: '02',
                title: 'preserve',
                body: 'we believe in the permanence of print. in images that live beyond the scroll. in work made to be held and kept and returned to.'
              },
              {
                num: '03',
                title: 'elevate',
                body: 'we treat family photography as the art form it is. we platform the work, celebrate the makers, and build a community worthy of both.'
              },
            ].map((p, i) => (
              <div key={p.num} className={`px-10 py-12 ${i < 2 ? 'md:border-r border-b md:border-b-0 border-[#E8E4DE]' : ''}`}>
                <p className="font-cormorant font-light text-[48px] text-mthr-dim leading-none mb-5">{p.num}</p>
                <h3 className="font-cormorant italic font-light text-[26px] text-mthr-black mb-4">{p.title}</h3>
                <p className="text-[13px] text-mthr-mid leading-[1.8]">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PHILOSOPHY ── */}
        <section className="border-b border-[#E8E4DE]">
          <div className="text-center px-8 pt-16 pb-12 border-b border-[#E8E4DE]">
            <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-4">Philosophy</p>
            <h2 className="font-cormorant italic font-light text-[52px] md:text-[68px] leading-[1.05] text-mthr-black mb-5">
              print. presence.<br />community. always.
            </h2>
          </div>

          <div className="max-w-2xl mx-auto px-8 py-16">
            <div className="space-y-6 font-cormorant font-light text-[18px] leading-[1.9] text-mthr-dark">
              <p>we live in a world of infinite images.</p>
              <p>they scroll past in fractions of a second, beautiful and forgotten in the same breath. we consume more photographs in a single day than our grandparents saw in a lifetime — and yet somehow, we feel less seen.</p>
              <p className="font-cormorant italic text-[20px] text-mthr-black">we believe print changes that.</p>
              <p>a printed image demands to be held. it asks you to slow down, to look, to feel something. it cannot be scrolled past. it cannot be lost in an algorithm. it exists, physically, in the world — and that existence means something.</p>
              <p>we also believe that the photographers who make this work deserve to be seen.</p>
              <p>not just liked. not just followed. truly seen — for the craft they have built, the vision they carry, the quiet dedication it takes to show up and make something real.</p>
              <p>and we believe that none of this happens alone.</p>
              <p>the best work comes from communities where photographers push each other, inspire each other, share their locations and their light and their hardest-won lessons. where rising together is the whole point.</p>
              <p className="font-cormorant italic text-[20px] text-mthr-black">that is the MTHR philosophy. print. presence. community. always.</p>
            </div>
          </div>
        </section>



        {/* ── CTA ROW ── */}
        <section className="bg-mthr-black">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { label: 'Submit your work', href: '/submit' },
              { label: 'Explore the community', href: '/community' },
              { label: 'View the magazine', href: '/magazine' },
            ].map((cta, i) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={`px-8 py-6 text-center text-[10px] tracking-[0.18em] uppercase font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors ${i < 2 ? 'md:border-r border-b md:border-b-0 border-white/10' : ''}`}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
