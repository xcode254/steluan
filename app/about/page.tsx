// app/about/page.tsx
import { theme } from '@/styles/theme'

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '56px 32px' }}>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 30, marginBottom: 18 }}>
        About Steluan LTD
      </h1>
      <p style={{ fontFamily: theme.font.body, color: '#444', fontSize: 15, lineHeight: 1.8, marginBottom: 18 }}>
        Steluan LTD connects buyers, renters, and agents across Kenya —
        houses, apartments, land, and commercial properties, all in one
        place. Every listing goes through a real agent, and every
        viewing request goes straight to them, not a call center.
      </p>
      <p style={{ fontFamily: theme.font.body, color: '#444', fontSize: 15, lineHeight: 1.8 }}>
        Whether you&apos;re searching for your first apartment in
        Westlands or a half-acre plot outside Kiambu, our goal is the
        same: make it straightforward to find a property, and just as
        straightforward for agents to list one.
      </p>
    </main>
  )
}
