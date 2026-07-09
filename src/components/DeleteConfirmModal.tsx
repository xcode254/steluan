'use client'

// src/components/DeleteConfirmModal.tsx
import { theme } from '@/styles/theme'

export function DeleteConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
  busy,
}: {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13,31,60,0.55)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: theme.radius.lg,
          width: 420,
          maxWidth: '100%',
          padding: 28,
          boxShadow: theme.shadow.modal,
        }}
      >
        <h3 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 18, marginTop: 0 }}>
          {title}
        </h3>
        <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{
              background: 'none',
              border: `1px solid ${theme.color.navy}`,
              color: theme.color.navy,
              borderRadius: 6,
              padding: '9px 18px',
              fontFamily: theme.font.body,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            style={{
              background: theme.color.red,
              border: 'none',
              color: '#fff',
              borderRadius: 6,
              padding: '9px 18px',
              fontFamily: theme.font.body,
              fontSize: 13,
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
