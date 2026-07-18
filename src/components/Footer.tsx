// src/components/Footer.tsx
//
// Only links to pages that actually exist. An earlier standalone
// mockup had Privacy/Terms/Contact links going nowhere — rather than
// recreate that with dead links, this only includes what the app
// genuinely has: Home, Properties, and a real mailto for contact
// (there's no dedicated contact page — per-property "Request a
// viewing" is the app's actual contact mechanism).
import Link from 'next/link'
import { theme } from '@/styles/theme'

export function Footer() {
  return (
    <footer style={{ background: theme.color.navy, marginTop: 60 }}>
      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '40px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <svg width="26" height="26" viewBox="0 0 34 34">
              <polygon points="17,2 32,30 2,30" fill={theme.color.gold} />
              <polygon points="17,10 26,28 8,28" fill={theme.color.navy} />
            </svg>
            <span style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>
              STELUAN LTD
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: theme.font.body, fontSize: 13, lineHeight: 1.6, maxWidth: 320 }}>
            Real estate listings across Kenya — houses, apartments, land, and commercial properties.
          </p>
        </div>

        <div style={{ flex: '0 1 160px' }}>
          <div style={{ color: '#fff', fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Browse
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/" style={footerLinkStyle}>Home</Link>
            <Link href="/properties" style={footerLinkStyle}>All Properties</Link>
            <Link href="/properties?category=land" style={footerLinkStyle}>Land</Link>
            <Link href="/properties?category=commercial" style={footerLinkStyle}>Commercial</Link>
          </div>
        </div>

        <div style={{ flex: '0 1 160px' }}>
          <div style={{ color: '#fff', fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Contact
          </div>
          <a href="mailto:hello@steluan.co.ke" style={footerLinkStyle}>hello@steluan.co.ke</a>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '18px 32px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.45)',
          fontFamily: theme.font.body,
          fontSize: 12,
        }}
      >
        © {new Date().getFullYear()} Steluan Ltd. All rights reserved.
      </div>
    </footer>
  )
}

const footerLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontFamily: theme.font.body,
  fontSize: 13,
  textDecoration: 'none',
}
