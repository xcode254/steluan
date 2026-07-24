'use client'

// src/components/PropertyMapView.tsx
// Lightweight SVG map — no external map provider wired up yet, so
// pins are projected from lat/long onto a simple grid. Good enough
// to browse listings spatially; swap for Mapbox/Google Maps later
// without touching the data layer.

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { theme } from '@/styles/theme'
import type { Property } from '@/types/database'

export function PropertyMapView({ properties }: { properties: Property[] }) {
  const located = properties.filter(
    (p): p is Property & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null
  )
  const [selectedId, setSelectedId] = useState<string | null>(located[0]?.id ?? null)
  const selected = located.find((p) => p.id === selectedId) ?? located[0]

  if (located.length === 0) {
    return (
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, textAlign: 'center', padding: '40px 0' }}>
        None of these listings have a map location yet.
      </p>
    )
  }

  const lats = located.map((p) => p.latitude)
  const lngs = located.map((p) => p.longitude)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const latSpan = maxLat - minLat || 0.01
  const lngSpan = maxLng - minLng || 0.01

  const W = 700, H = 420, PAD = 40

  function project(lat: number, lng: number) {
    const x = PAD + ((lng - minLng) / lngSpan) * (W - PAD * 2)
    const y = PAD + ((maxLat - lat) / latSpan) * (H - PAD * 2)
    return { x, y }
  }

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: '2 1 420px', borderRadius: 12, overflow: 'hidden', boxShadow: theme.shadow.card, background: '#dbe4f2' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 420, display: 'block' }}>
          <rect width={W} height={H} fill="#dbe4f2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(H / 6) * i} x2={W} y2={(H / 6) * i} stroke="#c7d3e8" strokeWidth={1} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`v${i}`} x1={(W / 8) * i} y1={0} x2={(W / 8) * i} y2={H} stroke="#c7d3e8" strokeWidth={1} />
          ))}

          {located.map((p) => {
            const { x, y } = project(p.latitude, p.longitude)
            const isSel = p.id === selected?.id
            return (
              <g key={p.id} onClick={() => setSelectedId(p.id)} style={{ cursor: 'pointer' }}>
                {isSel && (
                  <text x={x} y={y - 16} textAnchor="middle" fontSize={11} fontFamily={theme.font.body} fontWeight={700} fill={theme.color.navy}>
                    {p.name}
                  </text>
                )}
                <circle cx={x} cy={y} r={isSel ? 12 : 9} fill={isSel ? theme.color.gold : theme.color.navy} stroke="#fff" strokeWidth={2} />
              </g>
            )
          })}
        </svg>
      </div>

      {selected && (
        <div style={{ flex: '1 1 260px', minWidth: 240, background: '#fff', borderRadius: 12, boxShadow: theme.shadow.card, padding: 20 }}>
          {selected.primary_image && (
            <div style={{ position: 'relative', width: '100%', height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
              <Image
                src={selected.primary_image}
                alt={selected.name}
                fill
                sizes="260px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
          <div style={{ fontFamily: theme.font.data, fontWeight: 600, color: theme.color.navy, fontSize: 18 }}>
            {selected.currency} {Number(selected.price).toLocaleString()}
          </div>
          <div style={{ fontFamily: theme.font.body, fontSize: 14, marginTop: 4 }}>{selected.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted, margin: '6px 0 14px' }}>
            <MapPin size={12} /> {selected.location}
          </div>
          {selected.amenities?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {selected.amenities.slice(0, 3).map((a) => (
                <span key={a} style={{ background: '#f0f4fa', color: theme.color.navy, borderRadius: 4, padding: '3px 8px', fontSize: 11, fontFamily: theme.font.body }}>
                  {a}
                </span>
              ))}
            </div>
          )}
          <Link
            href={`/properties/${selected.id}`}
            style={{ display: 'block', textAlign: 'center', background: theme.color.gold, color: '#fff', borderRadius: 6, padding: '10px 0', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700 }}
          >
            View Details
          </Link>
        </div>
      )}
    </div>
  )
}
