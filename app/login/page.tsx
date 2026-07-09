'use client'

// app/login/page.tsx
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth'
import { theme } from '@/styles/theme'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signInWithEmail(email, password)
      router.push(redirect)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Check your email and password.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in with Google.')
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
        <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 24, marginTop: 0, marginBottom: 6 }}>
          Log in
        </h1>
        <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 13, marginBottom: 24 }}>
          Sign in to manage listings and viewing requests.
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
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button type="submit" disabled={busy} style={primaryButtonStyle(busy)}>
            {busy ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: theme.color.border }} />
          <span style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: theme.color.border }} />
        </div>

        <button onClick={handleGoogle} style={googleButtonStyle}>
          Continue with Google
        </button>

        <p style={{ fontFamily: theme.font.body, fontSize: 13, color: theme.color.textMuted, marginTop: 22, textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: theme.color.gold, fontWeight: 700 }}>
            Sign up
          </Link>
        </p>
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

const googleButtonStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: `1px solid ${theme.color.border}`,
  color: theme.color.navy,
  borderRadius: 6,
  padding: '10px 0',
  fontFamily: theme.font.body,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}
