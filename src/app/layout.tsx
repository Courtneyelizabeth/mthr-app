import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dm = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MTHR Magazine — Where real life is the story.',
  description: 'A community for photographers. Share your work, discover beautiful places, and get featured in MTHR Magazine.',
  openGraph: {
    title: 'MTHR Magazine',
    description: 'Where real life is the story.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dm.variable}`}>
      <body className={`bg-[#F5F2EE] font-dm text-mthr-black antialiased ${barlowCondensed.variable}`}>
        {children}
      </body>
    </html>
  )
}
