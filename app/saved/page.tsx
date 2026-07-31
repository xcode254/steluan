// app/saved/page.tsx
import { Heart } from 'lucide-react'
import { theme } from '@/styles/theme'

// Placeholder — the heart icon on property cards is UI-only for now
// (deliberately deferred: real favorites needs a saved_properties
// table, RLS, and this page actually querying it). Honest "coming
// soon" rather than pretending it works.
export default function SavedPage() {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <Heart size={48} color={theme.color.gold} />
      </div>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 24, marginBottom: 8 }}>
        Saved properties — coming soon
      </h1>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, maxWidth: 380 }}>
        You&apos;ll be able to save listings and come back to them
        here. This page isn&apos;t wired up yet.
      </p>
    </main>
  )
}
