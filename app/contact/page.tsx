// app/contact/page.tsx
import { Mail } from 'lucide-react'
import { theme } from '@/styles/theme'

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '56px 32px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 30, marginBottom: 14 }}>
        Get in Touch
      </h1>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 15, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
        Looking at a specific property? Use the &quot;Request a
        viewing&quot; form on that listing to reach the agent
        directly — it&apos;s faster than a general inquiry. For
        anything else, reach us here:
      </p>
      <a
        href="mailto:hello@steluan.co.ke"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: theme.color.navy,
          color: '#fff',
          borderRadius: 8,
          padding: '14px 28px',
          fontFamily: theme.font.body,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <Mail size={18} /> hello@steluan.co.ke
      </a>
    </main>
  )
}
