'use client'

// src/components/ImageUploadZone.tsx
// Works with a unified "slot" list so already-uploaded images and
// freshly-picked local files share the same UI, drag/drop, and
// primary-image selection — PropertyForm decides what to do with
// each kind at submit time.

import { useRef, useState } from 'react'
import { FolderOpen, Star, X } from 'lucide-react'
import { theme } from '@/styles/theme'

export interface ImageSlot {
  tempId: string
  url: string
  kind: 'existing' | 'pending'
}

export function ImageUploadZone({
  slots,
  primaryTempId,
  onAddFiles,
  onRemove,
  onSetPrimary,
}: {
  slots: ImageSlot[]
  primaryTempId: string | null
  onAddFiles: (files: FileList) => void
  onRemove: (tempId: string) => void
  onSetPrimary: (tempId: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div>
      <label style={{ fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: theme.color.navy, display: 'block', marginBottom: 6 }}>
        Property images *
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) onAddFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? theme.color.gold : theme.color.border}`,
          borderRadius: 8,
          padding: 20,
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 12,
          background: dragging ? '#fffbf2' : '#fafafa',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><FolderOpen size={28} color={theme.color.textMuted} /></div>
        <div style={{ fontFamily: theme.font.body, fontSize: 13, color: '#666' }}>
          Drag photos here, or <span style={{ color: theme.color.gold, fontWeight: 700 }}>browse</span>
        </div>
        <div style={{ fontFamily: theme.font.body, fontSize: 11, color: '#aaa', marginTop: 4 }}>JPG, PNG, or WEBP — up to 10MB each</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.length) onAddFiles(e.target.files) }}
        />
      </div>

      {slots.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {slots.map((slot) => {
            const isPrimary = slot.tempId === primaryTempId
            return (
              <div
                key={slot.tempId}
                style={{
                  position: 'relative',
                  width: 100,
                  height: 80,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: isPrimary ? `3px solid ${theme.color.gold}` : '3px solid transparent',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* Intentionally plain <img>, not next/image: pending
                    slots are blob: URLs from URL.createObjectURL(),
                    which Next's image optimizer can't process (it
                    fetches server-side; blob: URLs only exist in this
                    browser tab). These are small upload-form
                    thumbnails, not primary content, so it's not worth
                    branching per-slot to optimize just the existing ones. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slot.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isPrimary && (
                  <div style={{ position: 'absolute', top: 4, left: 4, background: theme.color.gold, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 3, padding: '1px 5px' }}>
                    PRIMARY
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    background: 'rgba(0,0,0,0)',
                    opacity: 0,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSetPrimary(slot.tempId) }}
                    title="Set as primary photo"
                    aria-label="Set as primary photo"
                    style={{ background: theme.color.gold, border: 'none', color: '#fff', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Star size={13} fill="#fff" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(slot.tempId) }}
                    title="Remove"
                    aria-label="Remove photo"
                    style={{ background: theme.color.red, border: 'none', color: '#fff', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
