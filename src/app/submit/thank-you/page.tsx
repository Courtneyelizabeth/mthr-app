import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="max-w-lg text-center">
          <div className="w-16 h-[1px] bg-[#D0CCC6] mx-auto mb-10" />
          <h1 className="font-cormorant italic font-light text-[52px] leading-none text-mthr-black mb-4">
            thank you.
          </h1>
          <p className="font-cormorant font-light text-[20px] text-mthr-black mb-3">
            your images have been submitted.
          </p>
          <p className="text-[13px] text-mthr-mid leading-[1.8] mb-10 max-w-md mx-auto">
            we review every submission carefully and personally. if your work is selected for the app or instagram, you'll hear from us within 7 days. magazine submissions are reviewed within 22 days. we're so glad you're here.
          </p>
          <div className="w-16 h-[1px] bg-[#D0CCC6] mx-auto mb-10" />
          <div className="flex items-center justify-center gap-4">
            <Link href="/explore" className="px-6 py-2.5 text-[10px] tracking-[0.16em] uppercase font-medium bg-mthr-black text-white rounded-full hover:bg-mthr-dark transition-colors">
              explore the feed
            </Link>
            <Link href="/submit" className="px-6 py-2.5 text-[10px] tracking-[0.16em] uppercase font-medium border border-mthr-b2 text-mthr-mid rounded-full hover:border-mthr-black hover:text-mthr-black transition-colors">
              submit more work
            </Link>
          </div>
          <p className="mt-10 text-[10px] tracking-[0.14em] uppercase text-mthr-dim">
            where real life is the story. · mthrmag.com
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
