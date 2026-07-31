// src/components/FindByLocation.tsx
import Link from 'next/link'
import Image from 'next/image'
import { theme } from '@/styles/theme'

const LOCATIONS = [
  { name: 'Westlands', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=300&q=80' },
  { name: 'Karen',     image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&q=80' },
  { name: 'Runda',     image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&q=80' },
  { name: 'Kilimani',  image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&q=80' },
]

export function FindByLocation() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 22, boxShadow: theme.shadow.card, marginTop: 18 }}>
      <h3 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 17, margin: '0 0 4px' }}>
        Find by Location
      </h3>
      <p style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted, margin: '0 0 16px' }}>
        Explore properties in popular areas
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {LOCATIONS.map((loc) => (
          <Link
            key={loc.name}
            href={`/properties?location=${encodeURIComponent(loc.name)}`}
            style={{ position: 'relative', height: 78, borderRadius: 8, overflow: 'hidden', display: 'block' }}
          >
            <Image src={loc.image} alt={loc.name} fill sizes="140px" style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,31,60,0.4)' }} />
            <span
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                color: '#fff',
                fontFamily: theme.font.body,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {loc.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/properties"
        style={{ display: 'block', marginTop: 14, fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: theme.color.gold }}
      >
        View All Locations →
      </Link>
    </div>
  )
}
