'use client'

// src/components/PropertyGrid.tsx
import { useState } from 'react'
import { List, Map } from 'lucide-react'
import { PropertyCard } from './PropertyCard'
import { PropertyMapView } from './PropertyMapView'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { deleteProperty } from '@/lib/properties'
import { theme } from '@/styles/theme'
import type { Property } from '@/types/database'

export function PropertyGrid({
  initialProperties,
  showViewToggle = true,
}: {
  initialProperties: Property[]
  showViewToggle?: boolean
}) {
  const [properties, setProperties] = useState(initialProperties)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await deleteProperty(pendingDelete.id)
      setProperties((prev) => prev.filter((p) => p.id !== pendingDelete.id))
      setNotice(`"${pendingDelete.name}" was removed from listings.`)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not delete this property.')
    } finally {
      setBusy(false)
      setPendingDelete(null)
      setTimeout(() => setNotice(''), 4000)
    }
  }

  if (properties.length === 0) {
    return (
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, textAlign: 'center', padding: '40px 0' }}>
        No properties match yet. Check back soon, or adjust your search.
      </p>
    )
  }

  return (
    <>
      {showViewToggle && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['list', 'map'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  background: view === v ? theme.color.navy : '#fff',
                  color: view === v ? '#fff' : theme.color.navy,
                  border: `1px solid ${theme.color.navy}`,
                  borderRadius: 4,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontFamily: theme.font.body,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {v === 'list' ? <List size={14} /> : <Map size={14} />}
                {v === 'list' ? 'List View' : 'Map View'}
              </button>
            ))}
          </div>
        </div>
      )}

      {notice && (
        <div
          style={{
            background: theme.color.navy,
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            fontFamily: theme.font.body,
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {notice}
        </div>
      )}

      {view === 'map' ? (
        <PropertyMapView properties={properties} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} onRequestDelete={setPendingDelete} />
          ))}
        </div>
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          title="Delete property"
          message={`Remove "${pendingDelete.name}" from listings? This can't be undone from here.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
          busy={busy}
        />
      )}
    </>
  )
}
