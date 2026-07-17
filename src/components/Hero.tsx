'use client'

// src/components/Hero.tsx
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { theme } from '@/styles/theme'

export function Hero() {
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
        <div style={{ position: 'absolute', top: '50%', left: 48, transform: 'translateY(-58%)' }}>
          <h1 style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1.12 }}>
            Find Your
            <br />
            Dream Property
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: theme.font.body, fontSize: 14, marginTop: 8 }}>
            Explore the best properties for sale &amp; rent in Kenya
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        style={{
          position: 'absolute',
          bottom: -26,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          borderRadius: 8,
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          width: '90%',
          maxWidth: 720,
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
            borderRadius: 4,
            padding: '10px 26px',
            fontFamily: theme.font.body,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Search
        </button>
      </form>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  flex: '1 1 120px',
  border: `1px solid ${theme.color.border}`,
  borderRadius: 4,
  padding: '9px 10px',
  fontFamily: theme.font.body,
  fontSize: 13,
  color: '#333',
  background: '#fff',
  minWidth: 0,
}
