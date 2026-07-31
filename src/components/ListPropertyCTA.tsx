// src/components/ListPropertyCTA.tsx
import Link from 'next/link'
import { theme } from '@/styles/theme'

export function ListPropertyCTA() {
  return (
    <div style={{ background: theme.color.navy, borderRadius: 12, padding: 22, marginTop: 18 }}>
      <h3 style={{ fontFamily: theme.font.display, color: '#fff', fontSize: 16, margin: '0 0 8px' }}>
        List Your Property With Us
      </h3>
      <p style={{ fontFamily: theme.font.body, color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
        Reach buyers and renters across Kenya quickly and easily.
      </p>
      <Link
        href="/properties/new"
        style={{
          display: 'inline-block',
          background: theme.color.gold,
          color: '#fff',
          borderRadius: 6,
          padding: '10px 20px',
          fontFamily: theme.font.body,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Get Started Now
      </Link>
    </div>
  )
}
