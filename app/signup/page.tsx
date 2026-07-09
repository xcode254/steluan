'use client'

// app/signup/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { theme } from '@/styles/theme'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const [busy, setBusy]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      await signUp(email, password, fullName)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 62px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.color.cream,
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: theme.radius.lg,
          padding: 36,
          width: 380,
          maxWidth: '100%',
          boxShadow: theme.shadow.card,
        }}
      >
        {done ? (
          <>
            <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 22, marginTop: 0 }}>
              Check your email
            </h1>
            <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, lineHeight: 1.6 }}>
              We sent a confirmation link to <strong>{email}</strong>. Confirm your
              address, then log in — new accounts start as viewers, and an
              admin can promote you to agent when you&apos;re ready to list
              properties.
            </p>
            <Link
              href="/login"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: 20,
                background: theme.color.gold,
                color: '#fff',
                borderRadius: 6,
                padding: '11px 0',
                fontFamily: theme.font.body,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Go to login
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 24, marginTop: 0, marginBottom: 6 }}>
              Create an account
            </h1>
            <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 13, marginBottom: 24 }}>
              Browse listings and save searches. Agents can request access
              afterward.
            </p>

            {error && (
              <div
                style={{
                  background: '#fdecec',
                  color: theme.color.red,
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: theme.font.body,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <p style={{ fontFamily: theme.font.body, fontSize: 11, color: theme.color.textMuted, marginTop: -10, marginBottom: 16 }}>
                At least 8 characters.
              </p>

              <button type="submit" disabled={busy} style={primaryButtonStyle(busy)}>
                {busy ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p style={{ fontFamily: theme.font.body, fontSize: 13, color: theme.color.textMuted, marginTop: 22, textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: theme.color.gold, fontWeight: 700 }}>
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: 12,
  fontWeight: 700,
  color: theme.color.navy,
  display: 'block',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.color.border}`,
  borderRadius: 6,
  padding: '10px 12px',
  fontFamily: theme.font.body,
  fontSize: 14,
  marginBottom: 16,
  boxSizing: 'border-box',
}

const primaryButtonStyle = (busy: boolean): React.CSSProperties => ({
  width: '100%',
  background: theme.color.gold,
  border: 'none',
  color: '#fff',
  borderRadius: 6,
  padding: '11px 0',
  fontFamily: theme.font.body,
  fontSize: 14,
  fontWeight: 700,
  cursor: busy ? 'not-allowed' : 'pointer',
  opacity: busy ? 0.7 : 1,
})
