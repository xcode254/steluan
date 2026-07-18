// app/not-found.tsx
import Link from 'next/link'
import { HomeIcon } from 'lucide-react'
import { theme } from '@/styles/theme'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 62px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.color.cream,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: 8 }}><HomeIcon size={52} color={theme.color.gold} /></div>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 28, margin: '0 0 8px' }}>
        Page not found
      </h1>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, marginBottom: 28, maxWidth: 380 }}>
        This listing may have been sold, archived, or the link is out of date.
      </p>
      <Link
        href="/"
        style={{
          background: theme.color.gold,
          color: '#fff',
          borderRadius: 6,
          padding: '11px 26px',
          fontFamily: theme.font.body,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        Back to home
      </Link>
    </main>
  )
}
