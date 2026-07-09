'use client'

// src/components/InviteUserModal.tsx
import { useState } from 'react'
import { theme } from '@/styles/theme'
import type { UserRole } from '@/types/database'

export function InviteUserModal({
  onClose,
  onInvite,
}: {
  onClose: () => void
  onInvite: (data: { email: string; fullName: string; role: UserRole }) => Promise<void>
}) {
  const [email, setEmail]       = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole]         = useState<UserRole>('agent')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !fullName.trim()) {
      setError('Email and full name are required.')
      return
    }
    setBusy(true)
    try {
      await onInvite({ email: email.trim(), fullName: fullName.trim(), role })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send invite.')
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.55)', zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{ background: '#fff', borderRadius: theme.radius.lg, width: 420, maxWidth: '100%', padding: 28, boxShadow: theme.shadow.modal }}>
        <h3 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 18, marginTop: 0 }}>
          Invite a user
        </h3>
        <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 13, marginTop: -6, marginBottom: 18 }}>
          They&apos;ll get an email with a link to set their password. Their role is
          already set — no need to promote them after they sign up.
        </p>

        {error && (
          <div style={{ background: '#fdecec', color: theme.color.red, padding: '9px 12px', borderRadius: 6, fontSize: 13, fontFamily: theme.font.body, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={{ ...inputStyle, marginBottom: 20 }}>
            <option value="viewer">Viewer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} disabled={busy} style={ghostButtonStyle}>Cancel</button>
            <button type="submit" disabled={busy} style={primaryButtonStyle(busy)}>
              {busy ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: theme.color.navy,
  display: 'block', marginBottom: 5,
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: `1px solid ${theme.color.border}`, borderRadius: 6, padding: '9px 11px',
  fontFamily: theme.font.body, fontSize: 13, marginBottom: 14, boxSizing: 'border-box',
}

const primaryButtonStyle = (busy: boolean): React.CSSProperties => ({
  background: theme.color.gold, border: 'none', color: '#fff', borderRadius: 6,
  padding: '9px 20px', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700,
  cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
})

const ghostButtonStyle: React.CSSProperties = {
  background: 'none', border: `1px solid ${theme.color.navy}`, color: theme.color.navy, borderRadius: 6,
  padding: '9px 18px', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, cursor: 'pointer',
}
