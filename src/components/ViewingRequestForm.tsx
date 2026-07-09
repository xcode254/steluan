'use client'

// src/components/ViewingRequestForm.tsx
import { useEffect, useState } from 'react'
import { useAuthContext } from './AuthProvider'
import { submitViewingRequest } from '@/lib/properties'
import { createClient } from '@/utils/supabase/client'
import { theme } from '@/styles/theme'

export function ViewingRequestForm({ propertyId }: { propertyId: string }) {
  const { user } = useAuthContext()
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy]   = useState(false)
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.full_name) setName(user.full_name)
    if (user?.phone) setPhone(user.phone)
    if (user) {
      createClient().auth.getUser().then(({ data }) => {
        if (data.user?.email) setEmail(data.user.email)
      })
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }
    setBusy(true)
    try {
      await submitViewingRequest({
        property_id: propertyId,
        requester_id: user?.id,
        contact_name: name,
        contact_email: email,
        contact_phone: phone || undefined,
        message: message || undefined,
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your request.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div style={{ background: '#eef8f1', color: theme.color.green, padding: 16, borderRadius: 8, fontFamily: theme.font.body, fontSize: 14 }}>
        Request sent. The agent will reach out to confirm a time.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#fdecec', color: theme.color.red, padding: '9px 12px', borderRadius: 6, fontSize: 13, fontFamily: theme.font.body, marginBottom: 12 }}>
          {error}
        </div>
      )}
      <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
      <textarea
        placeholder="Anything the agent should know? (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <button type="submit" disabled={busy} style={buttonStyle(busy)}>
        {busy ? 'Sending…' : 'Request a viewing'}
      </button>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.color.border}`,
  borderRadius: 6,
  padding: '9px 11px',
  fontFamily: theme.font.body,
  fontSize: 13,
  marginBottom: 10,
  boxSizing: 'border-box',
}

const buttonStyle = (busy: boolean): React.CSSProperties => ({
  width: '100%',
  background: theme.color.navy,
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
