import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2EE]">
      <TopNav />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <p className="text-[9px] tracking-[0.2em] uppercase text-mthr-mid font-medium mb-4">Legal</p>
        <h1 className="font-cormorant font-light text-[42px] leading-none text-mthr-black mb-2">terms of <em>use.</em></h1>
        <p className="text-[12px] text-mthr-mid mb-12">last updated: april 2026</p>
        <div className="space-y-10 text-[13px] text-mthr-dark leading-[1.9]">
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">agreement</h2>
            <p>by using MTHR — including creating an account, submitting work, or browsing the platform — you agree to these terms. if you do not agree, please do not use MTHR. these terms apply to all users of mthrmag.com.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">your account</h2>
            <p>you are responsible for maintaining the security of your account and all activity that occurs under it. you must be at least 18 years old to create an account. please use a real email address — we need it to contact you about your submissions.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">submitting work</h2>
            <p className="mb-3">when you submit images or written work to MTHR, you confirm that:</p>
            <ul className="space-y-1.5 pl-4">
              <li>— you are the original creator and hold full copyright</li>
              <li>— you have the rights and permissions to submit and publish the work</li>
              <li>— your subjects have given consent to be photographed and published</li>
              <li>— the work does not infringe on anyone else's intellectual property</li>
            </ul>
            <p className="mt-3">you retain copyright of everything you submit. by submitting, you grant MTHR a non-exclusive, royalty-free license to display, publish, and promote your work on the platform, in the print magazine, and in MTHR marketing materials. full credit will always be given. you may request removal at any time.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">featured badges</h2>
            <p>if your work is featured on MTHR, you may use the MTHR featured badge on your own website and social media to indicate the feature. the badge may only be used in direct reference to your MTHR feature and may not be altered or used in a way that implies an ongoing partnership or endorsement beyond the feature itself.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">platform content</h2>
            <p>all MTHR branding, editorial content, design, and copy is the intellectual property of MTHR and may not be reproduced, distributed, or used without written permission. this does not apply to work submitted by photographers, which remains their own.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">community standards</h2>
            <p>MTHR is a space built on respect — for photographers, for families, for real life. we reserve the right to remove any content or account that is harmful, dishonest, or inconsistent with the values of this community.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">editorial decisions</h2>
            <p>submission to MTHR does not guarantee publication. all editorial decisions — including selection for the platform, the feed, and the print magazine — are made at the sole discretion of the MTHR editorial team. we review every submission with care.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">limitation of liability</h2>
            <p>MTHR is provided as-is. we are not liable for any loss or damage arising from your use of the platform, including loss of submitted content due to technical failure. we strongly recommend keeping copies of all work you submit.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">changes to these terms</h2>
            <p>we may update these terms from time to time. if we make material changes, we will notify you by email. continued use of MTHR after changes constitutes acceptance of the updated terms.</p>
          </section>
          <section>
            <h2 className="font-medium text-mthr-black text-[11px] tracking-[0.12em] uppercase mb-3">contact</h2>
            <p>questions about these terms? reach us at <a href="mailto:hello@mthrmag.com" className="border-b border-mthr-mid hover:border-mthr-black transition-colors">hello@mthrmag.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
