import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-4">Legal</p>
        <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black mb-2">privacy <em>policy.</em></h1>
        <p className="text-[12px] text-mthr-mid mb-12">last updated: april 2026</p>
        <div className="space-y-10 text-[13px] text-mthr-dark leading-[1.9]">
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">who we are</h2>
            <p>MTHR is an editorial platform and print magazine for documentary family photographers, operated by Courtney Maxwell. we are based in colorado, usa. if you have questions about this policy, you can reach us at hello@mthrmag.com.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">what information we collect</h2>
            <p className="mb-3">when you create an account or submit work to MTHR, we collect:</p>
            <ul className="space-y-1.5 pl-4">
              <li>— your name and email address</li>
              <li>— your instagram handle and photography location</li>
              <li>— images and written content you submit</li>
              <li>— basic usage data (pages visited, actions taken)</li>
            </ul>
            <p className="mt-3">we do not collect payment information directly. any future payment processing will be handled by a third-party provider.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">how we use your information</h2>
            <p className="mb-3">we use your information to:</p>
            <ul className="space-y-1.5 pl-4">
              <li>— review and feature your submitted work on the MTHR platform and in the print magazine</li>
              <li>— send you notifications about your submission status</li>
              <li>— communicate with you about your account</li>
              <li>— improve the platform and your experience on it</li>
            </ul>
            <p className="mt-3">we do not sell your personal information to third parties. ever.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">your submitted work</h2>
            <p>you retain full copyright of every image and piece of writing you submit to MTHR. by submitting, you grant MTHR a non-exclusive license to display, publish, and promote your work on the platform, in the print magazine, and in MTHR marketing materials. full credit will always be given. you may request removal of your work at any time by contacting hello@mthrmag.com.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">third-party services</h2>
            <p>MTHR uses the following third-party services to operate:</p>
            <ul className="space-y-1.5 pl-4 mt-3">
              <li>— <strong>supabase</strong> — database and file storage</li>
              <li>— <strong>vercel</strong> — website hosting</li>
              <li>— <strong>resend</strong> — email delivery</li>
            </ul>
            <p className="mt-3">each of these services has their own privacy policy and data practices.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">cookies</h2>
            <p>we use only essential cookies required for authentication and site functionality. we do not use advertising or tracking cookies.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">your rights</h2>
            <p>you have the right to access, correct, or delete your personal information at any time. to make a request, email us at hello@mthrmag.com. we will respond within 30 days.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">changes to this policy</h2>
            <p>if we make material changes to this policy, we will notify you by email or by posting a notice on the site. continued use of MTHR after changes constitutes acceptance of the updated policy.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">contact</h2>
            <p>questions about privacy? reach us at <a href="mailto:hello@mthrmag.com" className="border-b border-mthr-mid hover:border-mthr-black transition-colors">hello@mthrmag.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
