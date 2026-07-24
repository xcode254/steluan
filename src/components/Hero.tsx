'use client'

// src/components/Hero.tsx
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Building2, Users, Search } from 'lucide-react'
import { theme } from '@/styles/theme'

export function Hero({
  listingCount = 0,
  agentCount = 0,
}: {
  listingCount?: number
  agentCount?: number
}) {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minBeds, setMinBeds] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (type) params.set('type', type)
    if (location) params.set('location', location)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minBeds) params.set('minBeds', minBeds)
    router.push(`/properties${params.toString() ? `?${params}` : ''}`)
  }

  return (
    // Outer wrapper has NO overflow:hidden — the search form is
    // positioned to intentionally float below the image, and clipping
    // here would cut it off. Only the inner box (image + gradient +
    // heading) needs its own overflow:hidden to keep the image height
    // fixed; the form is a sibling of that box, not a descendant, so
    // it isn't subject to the same clipping.
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(13,31,60,0.88) 45%, rgba(13,31,60,0.25))',
          }}
        />
        {/* Headline sized down slightly and the search bar enlarged
            below — search owns the hero rather than sharing top
            billing with a big headline, closer to how Zillow treats
            search as the actual product rather than a secondary
            element under branding. */}
        <div style={{ position: 'absolute', top: '42%', left: 48, transform: 'translateY(-50%)' }}>
          <h1 style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.15 }}>
            Find Your Dream Property
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: theme.font.body, fontSize: 14, marginTop: 6 }}>
            Explore the best properties for sale &amp; rent in Kenya
          </p>

          {/* Real trust stats, not decorative — fetched server-side
              in app/page.tsx. Credibility signals belong above the
              fold as actual design elements, not buried lower down. */}
          {(listingCount > 0 || agentCount > 0) && (
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              {listingCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff' }}>
                  <Building2 size={16} color={theme.color.gold} />
                  <span style={{ fontFamily: theme.font.data, fontSize: 14, fontWeight: 600 }}>{listingCount}+</span>
                  <span style={{ fontFamily: theme.font.body, fontSize: 12, opacity: 0.85 }}>listings</span>
                </div>
              )}
              {agentCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff' }}>
                  <Users size={16} color={theme.color.gold} />
                  <span style={{ fontFamily: theme.font.data, fontSize: 14, fontWeight: 600 }}>{agentCount}+</span>
                  <span style={{ fontFamily: theme.font.body, fontSize: 12, opacity: 0.85 }}>verified agents</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enlarged padding and a bolder, icon-led Search button — the
          search bar is the primary interactive element on this page,
          sized to feel that way rather than like one form among
          several page elements. */}
      <form
        onSubmit={handleSearch}
        style={{
          position: 'absolute',
          bottom: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          borderRadius: 10,
          padding: '18px 22px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 48px rgba(13,31,60,0.22)',
          width: '92%',
          maxWidth: 780,
        }}
      >
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          <option value="">Any category</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
          <option value="">Any type</option>
          <option value="For Sale">For Sale</option>
          <option value="For Rent">For Rent</option>
        </select>
        <input
          placeholder="Location (e.g. Nairobi)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ ...selectStyle, flex: '1 1 160px' }}
        />
        <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={selectStyle}>
          <option value="">Any price</option>
          <option value="3000000">Up to KES 3M</option>
          <option value="5000000">Up to KES 5M</option>
          <option value="10000000">Up to KES 10M</option>
          <option value="20000000">Up to KES 20M</option>
        </select>
        <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} style={selectStyle}>
          <option value="">Any beds</option>
          <option value="1">1+ beds</option>
          <option value="2">2+ beds</option>
          <option value="3">3+ beds</option>
          <option value="4">4+ beds</option>
        </select>
        <button
          type="submit"
          style={{
            background: theme.color.gold,
            border: 'none',
            color: '#fff',
            borderRadius: 6,
            padding: '12px 30px',
            fontFamily: theme.font.body,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Search size={16} /> Search
        </button>
      </form>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  flex: '1 1 120px',
  border: `1px solid ${theme.color.border}`,
  borderRadius: 6,
  padding: '11px 12px',
  fontFamily: theme.font.body,
  fontSize: 13,
  color: '#333',
  background: '#fff',
  minWidth: 0,
}
