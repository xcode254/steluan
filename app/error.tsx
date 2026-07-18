'use client'

// app/error.tsx
// Must be a Client Component — Next.js App Router convention for
// error boundaries. Catches unhandled errors in this route segment
// and below, showing this instead of Next's bare default error page.
import { useEffect } from 'react'
import { TriangleAlert } from 'lucide-react'
import { theme } from '@/styles/theme'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
      <div style={{ marginBottom: 8 }}><TriangleAlert size={52} color={theme.color.red} /></div>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 28, margin: '0 0 8px' }}>
        Something went wrong
      </h1>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, marginBottom: 28, maxWidth: 380 }}>
        {error.message || 'An unexpected error occurred. Try again, or head back home.'}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={reset}
          style={{
            background: theme.color.gold,
            border: 'none',
            color: '#fff',
            borderRadius: 6,
            padding: '11px 26px',
            fontFamily: theme.font.body,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            border: `1px solid ${theme.color.navy}`,
            color: theme.color.navy,
            borderRadius: 6,
            padding: '11px 26px',
            fontFamily: theme.font.body,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Back to home
        </a>
      </div>
    </main>
  )
}
