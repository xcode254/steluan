'use client'

// src/components/Hero.tsx
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Home, Building2, Briefcase, Search, MapPin } from 'lucide-react'
import { theme } from '@/styles/theme'

const TABS = [
  { key: 'buy',        label: 'Buy',        icon: Home,     type: 'For Sale' },
  { key: 'rent',       label: 'Rent',       icon: Building2, type: 'For Rent' },
  { key: 'commercial', label: 'Commercial', icon: Briefcase, type: '' },
] as const

export function Hero() {
  const router = useRouter()
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('buy')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const activeTab = TABS.find((t) => t.key === tab)!
    if (activeTab.type) params.set('type', activeTab.type)
    if (tab === 'commercial') params.set('category', 'commercial')
    else if (category) params.set('category', category)
    if (location)  params.set('location', location)
    if (minPrice)  params.set('minPrice', minPrice)
    if (maxPrice)  params.set('maxPrice', maxPrice)
    router.push(`/properties${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div style={{ background: '#eef2f7' }}>
      <div
        style={{
          maxWidth: theme.layout.maxWidth,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          minHeight: 500,
        }}
      >
        {/* Left — headline, tabs, search. Plain flow (not absolutely
            positioned over the image), so no overflow-clipping
            concerns and the search bar never gets cut off. */}
        <div style={{ flex: '1 1 460px', padding: '64px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ color: theme.color.navy, fontFamily: theme.font.display, fontSize: 44, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
            Find Your
            <br />
            Perfect Property
          </h1>
          <p style={{ color: theme.color.textMuted, fontFamily: theme.font.body, fontSize: 15, marginTop: 14, maxWidth: 400 }}>
            Discover the best homes, apartments and commercial properties in prime locations.
          </p>

          {/* Segmented Buy/Rent/Commercial tabs */}
          <div style={{ display: 'flex', gap: 2, marginTop: 28, background: '#fff', borderRadius: 8, padding: 4, width: 'fit-content', boxShadow: theme.shadow.card }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: tab === t.key ? theme.color.navy : 'transparent',
                  color: tab === t.key ? '#fff' : theme.color.navy,
                  border: 'none', borderRadius: 6, padding: '9px 18px', cursor: 'pointer',
                  fontFamily: theme.font.body, fontSize: 13, fontWeight: 600,
                }}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {/* Search card */}
          <form
            onSubmit={handleSearch}
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: 16,
              marginTop: 14,
              boxShadow: theme.shadow.card,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ flex: '2 1 180px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${theme.color.border}`, borderRadius: 6, padding: '10px 12px' }}>
              <MapPin size={16} color={theme.color.textMuted} />
              <input
                placeholder="Enter location — Ex: Westlands, Nairobi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ border: 'none', outline: 'none', fontFamily: theme.font.body, fontSize: 13, width: '100%' }}
              />
            </div>

            {tab !== 'commercial' && (
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

            <button
              type="submit"
              style={{
                background: theme.color.navy,
                border: 'none',
                color: '#fff',
                borderRadius: 6,
                padding: '10px 22px',
                fontFamily: theme.font.body,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              <Search size={15} /> Search
            </button>
          </form>
        </div>

        {/* Right — full-height photo, no dark overlay */}
        <div style={{ flex: '1 1 420px', position: 'relative', minHeight: 420 }}>
          <Image
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80"
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  flex: '1 1 130px',
  border: `1px solid ${theme.color.border}`,
  borderRadius: 6,
  padding: '10px 12px',
  fontFamily: theme.font.body,
  fontSize: 13,
  color: '#333',
  background: '#fff',
  minWidth: 0,
}
