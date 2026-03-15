import type { Metadata } from 'next'
import { Bebas_Neue, Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dm = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MTHR Magazine — Documentary Honest Imagery',
  description: 'A community for family photographers. Share your work, discover beautiful places, and get featured in MTHR Magazine.',
  openGraph: {
    title: 'MTHR Magazine',
    description: 'Documentary honest imagery — families, love, motherhood, fatherhood.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${cormorant.variable} ${dm.variable}`}>
      <body className="bg-mthr-white font-dm text-mthr-black antialiased">
        {children}
      </body>
    </html>
  )
}
