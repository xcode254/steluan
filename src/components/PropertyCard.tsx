'use client'

// src/components/PropertyCard.tsx
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BedDouble, Ruler, MapPin, User, Pencil, Trash2 } from 'lucide-react'
import { useAuthContext } from './AuthProvider'
import { canEditProperty, can } from '@/lib/auth'
import { theme, formatSize } from '@/styles/theme'
import type { Property } from '@/types/database'

const TAG_COLOR: Record<string, string> = {
  Featured: theme.color.gold,
  New:      theme.color.blue,
  Hot:      theme.color.red,
}

export function PropertyCard({
  property,
  onRequestDelete,
}: {
  property: Property
  onRequestDelete?: (property: Property) => void
}) {
  const { user } = useAuthContext()
  const router = useRouter()
  const [hover, setHover] = useState(false)

  const showEdit   = canEditProperty(user, property.agent_id)
  const showDelete = can(user, 'canDelete')

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: theme.radius.md,
        overflow: 'hidden',
        boxShadow: hover ? theme.shadow.cardHover : theme.shadow.card,
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={() => router.push(`/properties/${property.id}`)}
        style={{ position: 'relative', height: 170, overflow: 'hidden' }}
      >
        {property.primary_image && (
          <Image
            src={property.primary_image}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{
              objectFit: 'cover',
              transform: hover ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
          />
        )}
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: TAG_COLOR[property.tag] ?? theme.color.gold,
            color: '#fff',
            borderRadius: 4,
            padding: '2px 9px',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: theme.font.body,
          }}
        >
          {property.tag}
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(13,31,60,0.8)',
            color: '#fff',
            borderRadius: 4,
            padding: '2px 9px',
            fontSize: 10,
            fontFamily: theme.font.body,
          }}
        >
          {property.category === 'land' ? (
            <><Ruler size={11} /> {formatSize(property.size_value, property.size_unit)}</>
          ) : (
            <><BedDouble size={11} /> {property.beds}</>
          )}
          <span>· {property.type}</span>
        </span>

        {property.category !== 'house' && (
          <span
            style={{
              position: 'absolute',
              bottom: 34,
              left: 10,
              background: 'rgba(13,31,60,0.8)',
              color: '#fff',
              borderRadius: 4,
              padding: '2px 9px',
              fontSize: 10,
              fontFamily: theme.font.body,
              textTransform: 'capitalize',
            }}
          >
            {property.category}
          </span>
        )}

        {(showEdit || showDelete) && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            {showEdit && (
              <Link
                href={`/properties/${property.id}/edit`}
                onClick={(e) => e.stopPropagation()}
                style={iconButtonStyle}
                aria-label={`Edit ${property.name}`}
              >
                <Pencil size={14} color={theme.color.navy} />
              </Link>
            )}
            {showDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRequestDelete?.(property)
                }}
                style={{ ...iconButtonStyle, border: 'none', cursor: 'pointer' }}
                aria-label={`Delete ${property.name}`}
              >
                <Trash2 size={14} color={theme.color.red} />
              </button>
            )}
          </div>
        )}
      </div>

      <div onClick={() => router.push(`/properties/${property.id}`)} style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ color: theme.color.navy, fontFamily: theme.font.display, fontSize: 16, fontWeight: 700 }}>
            {property.currency} {Number(property.price).toLocaleString()}
          </span>
          <span style={{ color: theme.color.textMuted, fontSize: 11, fontFamily: theme.font.body }}>{property.type}</span>
        </div>
        <div style={{ color: theme.color.navy, fontFamily: theme.font.display, fontSize: 13, marginTop: 3 }}>
          {property.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.color.textMuted, fontSize: 11, fontFamily: theme.font.body, margin: '4px 0 10px' }}>
          <MapPin size={11} /> {property.location} · {formatSize(property.size_value, property.size_unit)}
        </div>
        {property.agent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${theme.color.border}`, paddingTop: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#dde4f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={13} color={theme.color.navy} />
            </div>
            <span style={{ fontFamily: theme.font.body, fontSize: 11, fontWeight: 700, color: theme.color.navy }}>
              {property.agent.full_name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

const iconButtonStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '50%',
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  textDecoration: 'none',
}
