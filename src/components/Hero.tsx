'use client'

// src/components/Hero.tsx
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Home, Building2, Briefcase, Trees, Sparkles, Search, MapPin, ShieldCheck, Users, Tag, RotateCcw } from 'lucide-react'
import { theme } from '@/styles/theme'

const TABS = [
  { key: 'buy',        label: 'Buy',        icon: Home,      type: 'For Sale', category: '' },
  { key: 'rent',       label: 'Rent',       icon: Building2, type: 'For Rent', category: '' },
  { key: 'commercial', label: 'Commercial', icon: Briefcase, type: '',         category: 'commercial' },
  { key: 'land',       label: 'Land',       icon: Trees,     type: '',         category: 'land' },
  { key: 'new',        label: 'New Homes',  icon: Sparkles,  type: '',         category: '' },
] as const

const AMENITY_CHIPS = ['Furnished', 'Parking', 'Swimming Pool', 'Garden']

export function Hero() {
  const router = useRouter()
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('buy')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minBeds, setMinBeds] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  function handleReset() {
    setLocation('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setMinBeds('')
    setAmenities([])
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const activeTab = TABS.find((t) => t.key === tab)!

    if (activeTab.type) params.set('type', activeTab.type)
    if (activeTab.category) params.set('category', activeTab.category)
    else if (category) params.set('category', category)
    if (tab === 'new') params.set('sort', 'newest')

    if (location)  params.set('location', location)
    if (minPrice)  params.set('minPrice', minPrice)
    if (maxPrice)  params.set('maxPrice', maxPrice)
    if (minBeds)   params.set('minBeds', minBeds)
    if (amenities.length) params.set('amenities', amenities.join(','))

    router.push(`/properties${params.toString() ? `?${params}` : ''}`)
  }

  return (
    // Outer has NO overflow:hidden — the search panel below overlaps
    // upward via negative margin, which needs to render outside the
    // image box's own bounds. Only the image box itself clips (fixed
    // height, its own overflow:hidden), so the overlap can't get cut
    // off the way it would with absolute positioning + a shared
    // clipping ancestor.
    <div>
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80"
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
            background: 'linear-gradient(to right, rgba(13,31,60,0.9) 40%, rgba(13,31,60,0.2))',
          }}
        />

        <div style={{ position: 'absolute', inset: 0, maxWidth: theme.layout.maxWidth, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
          {/* Trust pill — no fabricated client counts, just an honest
              statement of what's actually true about the platform. */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 20, padding: '6px 14px', marginBottom: 20,
            }}
          >
            <ShieldCheck size={14} color={theme.color.gold} />
            <span style={{ color: '#fff', fontFamily: theme.font.body, fontSize: 12 }}>Verified listings across Kenya</span>
          </div>

          <h1 style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
            Find Your
            <br />
            Perfect Property
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: theme.font.body, fontSize: 14, marginTop: 12, maxWidth: 420 }}>
            Discover the best homes, apartments and commercial properties in prime locations.
          </p>

          <div style={{ display: 'flex', gap: 22, marginTop: 18, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontFamily: theme.font.body, fontSize: 12 }}>
              <ShieldCheck size={14} color={theme.color.gold} /> Verified Listings
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontFamily: theme.font.body, fontSize: 12 }}>
              <Users size={14} color={theme.color.gold} /> Expert Agents
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontFamily: theme.font.body, fontSize: 12 }}>
              <Tag size={14} color={theme.color.gold} /> Best Prices
            </span>
          </div>
        </div>
      </div>

      {/* Search panel — negative margin pulls it up over the image's
          bottom edge without any absolute-positioning/overflow
          conflict. */}
      <div style={{ maxWidth: theme.layout.maxWidth, margin: '-64px auto 0', padding: '0 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 48px rgba(13,31,60,0.22)' }}>
          {/* 5-way tabs */}
          <div style={{ display: 'flex', gap: 2, background: '#f2f4f7', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 14, flexWrap: 'wrap' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: tab === t.key ? theme.color.navy : 'transparent',
                  color: tab === t.key ? '#fff' : theme.color.navy,
                  border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer',
                  fontFamily: theme.font.body, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ flex: '2 1 200px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${theme.color.border}`, borderRadius: 6, padding: '10px 12px' }}>
              <MapPin size={16} color={theme.color.textMuted} />
              <input
                placeholder="Enter location — Ex: Westlands, Nairobi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ border: 'none', outline: 'none', fontFamily: theme.font.body, fontSize: 13, width: '100%' }}
              />
            </div>

            {tab !== 'commercial' && tab !== 'land' && (
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
                <option value="">All Types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
              </select>
            )}

            <select value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={selectStyle}>
              <option value="">Min Price</option>
              <option value="1000000">KES 1M</option>
              <option value="3000000">KES 3M</option>
              <option value="5000000">KES 5M</option>
              <option value="10000000">KES 10M</option>
            </select>

            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={selectStyle}>
              <option value="">Max Price</option>
              <option value="5000000">KES 5M</option>
              <option value="10000000">KES 10M</option>
              <option value="20000000">KES 20M</option>
              <option value="50000000">KES 50M</option>
            </select>

            {tab !== 'land' && (
              <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} style={selectStyle}>
                <option value="">Bedrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            )}

            <button
              type="submit"
              style={{
                background: theme.color.navy, border: 'none', color: '#fff', borderRadius: 6,
                padding: '10px 22px', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
              }}
            >
              <Search size={15} /> Search
            </button>
          </form>

          {/* Quick-filter chips — real filters against the amenities
              column (migration 009), not decorative. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {AMENITY_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => toggleAmenity(chip)}
                style={{
                  background: amenities.includes(chip) ? theme.color.gold : '#fff',
                  color: amenities.includes(chip) ? '#fff' : theme.color.navy,
                  border: `1px solid ${amenities.includes(chip) ? theme.color.gold : theme.color.border}`,
                  borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
                  fontFamily: theme.font.body, fontSize: 12, fontWeight: 600,
                }}
              >
                {chip}
              </button>
            ))}
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto',
                background: 'none', border: 'none', cursor: 'pointer',
                color: theme.color.textMuted, fontFamily: theme.font.body, fontSize: 12,
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  flex: '1 1 110px',
  border: `1px solid ${theme.color.border}`,
  borderRadius: 6,
  padding: '10px 12px',
  fontFamily: theme.font.body,
  fontSize: 13,
  color: '#333',
  background: '#fff',
  minWidth: 0,
}
