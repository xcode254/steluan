import type { Metadata } from 'next'
import { Playfair_Display, Lato, IBM_Plex_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { VersionChecker } from '@/components/VersionChecker'
import './globals.css'

// next/font self-hosts these at build time — no external request, no
// layout shift, and (unlike a <link> tag or bare CSS font-family
// string) actually guarantees the font loads at all. theme.ts
// previously referenced 'Playfair Display' and 'Lato' by name without
// either ever being loaded anywhere, so the app was silently falling
// back to system fonts this whole time.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
})
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-body',
  display: 'swap',
})
// Monospace, reserved specifically for data — prices, beds/baths/sqm
// stats, dashboard numbers. A dedicated numeric voice is a small,
// distinctive detail borrowed from how polished real estate platforms
// (Compass, notably) separate "words" from "numbers" typographically.
const dataFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-data',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Steluan LTD — Real Estate Listings',
  description: 'Find your dream property in Kenya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable} ${dataFont.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <VersionChecker />
        </AuthProvider>
      </body>
    </html>
  )
}
