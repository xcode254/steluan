'use client'

// src/components/PropertyDetailView.tsx
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BedDouble, Bath, Ruler, Tag, MapPin, User, Pencil } from 'lucide-react'
import { useAuthContext } from './AuthProvider'
import { canEditProperty } from '@/lib/auth'
import { ViewingRequestForm } from './ViewingRequestForm'
import { PropertyCard } from './PropertyCard'
import { theme, formatSize } from '@/styles/theme'
import type { Property } from '@/types/database'

export function PropertyDetailView({
  property,
  similarProperties = [],
}: {
  property: Property
  similarProperties?: Property[]
}) {
  const { user } = useAuthContext()
  const images = property.images?.length
    ? [...property.images].sort((a, b) => a.sort_order - b.sort_order)
    : property.primary_image
    ? [{ id: 'primary', url: property.primary_image }]
    : []
  const [idx, setIdx] = useState(0)
  const showEdit = canEditProperty(user, property.agent_id)

  return (
    <main style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link href="/properties" style={{ fontFamily: theme.font.body, fontSize: 14, color: theme.color.navy }}>
          ← Back to listings
        </Link>
        {showEdit && (
          <Link
            href={`/properties/${property.id}/edit`}
            style={{
              background: theme.color.gold,
              color: '#fff',
              borderRadius: 6,
              padding: '8px 18px',
              fontFamily: theme.font.body,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Pencil size={14} /> Edit property
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 420px' }}>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 360, background: '#eee' }}>
            {images[idx] && (
              <Image
                src={images[idx].url}
                alt={property.name}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 700px"
                style={{ objectFit: 'cover' }}
              />
            )}
            <div
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(13,31,60,0.75))',
                padding: '22px 22px 16px',
              }}
            >
              <div style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 24, fontWeight: 700 }}>{property.name}</div>
              <span
                style={{
                  background: property.type === 'For Rent' ? theme.color.blue : theme.color.gold,
                  color: '#fff', borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 700, fontFamily: theme.font.body,
                }}
              >
                {property.type}
              </span>
            </div>
            {images.length > 1 && (
              <>
                <button onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)} style={navButtonStyle('left')}>‹</button>
                <button onClick={() => setIdx((i) => (i + 1) % images.length)} style={navButtonStyle('right')}>›</button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {images.map((img, i) => (
                <Image
                  key={img.id}
                  src={img.url}
                  alt=""
                  width={64}
                  height={48}
                  onClick={() => setIdx(i)}
                  style={{
                    objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
                    border: i === idx ? `2px solid ${theme.color.gold}` : '2px solid transparent',
                    opacity: i === idx ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
          )}

          {property.description && (
            <p style={{ fontFamily: theme.font.body, color: '#444', fontSize: 14, lineHeight: 1.7, marginTop: 24 }}>
              {property.description}
            </p>
          )}

          {property.amenities?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 15, marginBottom: 10 }}>Amenities</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {property.amenities.map((a) => (
                  <span key={a} style={{ background: '#f0f4fa', color: theme.color.navy, borderRadius: 4, padding: '4px 10px', fontSize: 12, fontFamily: theme.font.body }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 300px', minWidth: 280 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: theme.shadow.card, marginBottom: 18 }}>
            <div style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.navy, marginBottom: 14 }}>
              {property.currency} {Number(property.price).toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 12, fontFamily: theme.font.body, fontSize: 13, color: '#555' }}>
              {property.category !== 'land' && (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BedDouble size={15} /> {property.beds} beds</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Bath size={15} /> {property.baths} baths</span>
                </>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Ruler size={15} /> {formatSize(property.size_value, property.size_unit)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, textTransform: 'capitalize' }}><Tag size={15} /> {property.category}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: theme.color.textMuted, fontSize: 12, fontFamily: theme.font.body, marginBottom: 16 }}>
              <MapPin size={13} /> {property.location}
            </div>

            {property.agent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${theme.color.border}`, paddingTop: 14, marginBottom: 18 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#dde4f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color={theme.color.navy} /></div>
                <div>
                  <div style={{ fontFamily: theme.font.body, fontWeight: 700, color: theme.color.navy, fontSize: 13 }}>{property.agent.full_name}</div>
                  <div style={{ fontFamily: theme.font.body, fontSize: 11, color: theme.color.textMuted }}>Listing agent</div>
                </div>
              </div>
            )}

            <ViewingRequestForm propertyId={property.id} />
          </div>
        </div>
      </div>

      {similarProperties.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 20, marginBottom: 18 }}>
            Similar Properties
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 18,
            }}
          >
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

function navButtonStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [side]: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.85)',
    border: 'none',
    borderRadius: '50%',
    width: 36,
    height: 36,
    cursor: 'pointer',
    fontSize: 18,
  } as React.CSSProperties
}
