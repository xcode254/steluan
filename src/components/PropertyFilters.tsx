'use client'

// src/components/PropertyFilters.tsx
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { theme } from '@/styles/theme'

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [type, setType]         = useState(searchParams.get('type') ?? '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [minBeds, setMinBeds]   = useState(searchParams.get('minBeds') ?? '')
  const [sort, setSort]         = useState(searchParams.get('sort') ?? 'newest')

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (category) params.set('category', category)
    if (type)     params.set('type', type)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minBeds)  params.set('minBeds', minBeds)
    if (sort && sort !== 'newest') params.set('sort', sort)
    router.push(`/properties${params.toString() ? `?${params}` : ''}`)
  }

  function clearFilters() {
    setLocation(''); setCategory(''); setType('')
    setMinPrice(''); setMaxPrice(''); setMinBeds(''); setSort('newest')
    router.push('/properties')
  }

  const hasActiveFilters = location || category || type || minPrice || maxPrice || minBeds || (sort !== 'newest')

  return (
    <form
      onSubmit={applyFilters}
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: 20,
        boxShadow: theme.shadow.card,
        marginBottom: 28,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'flex-end',
      }}
    >
      <Field label="Location">
        <input
          placeholder="e.g. Nairobi"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          <option value="">Any category</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
      </Field>

      <Field label="Type">
        <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
          <option value="">Any type</option>
          <option value="For Sale">For Sale</option>
          <option value="For Rent">For Rent</option>
        </select>
      </Field>

      <Field label="Min price (KES)">
        <input
          type="number"
          min="0"
          placeholder="No min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ ...inputStyle, width: 120 }}
        />
      </Field>

      <Field label="Max price (KES)">
        <input
          type="number"
          min="0"
          placeholder="No max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ ...inputStyle, width: 120 }}
        />
      </Field>

      <Field label="Min beds">
        <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} style={{ ...inputStyle, width: 90 }}>
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </Field>

      <Field label="Sort by">
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...inputStyle, width: 150 }}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </Field>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={applyButtonStyle}>Apply</button>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} style={clearButtonStyle}>
            Clear
          </button>
        )}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontFamily: theme.font.body, fontSize: 11, fontWeight: 700, color: theme.color.navy, display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  border: `1px solid ${theme.color.border}`,
  borderRadius: 6,
  padding: '8px 10px',
  fontFamily: theme.font.body,
  fontSize: 13,
  color: '#333',
  background: '#fff',
  minWidth: 130,
}

const applyButtonStyle: React.CSSProperties = {
  background: theme.color.gold,
  border: 'none',
  color: '#fff',
  borderRadius: 6,
  padding: '9px 20px',
  fontFamily: theme.font.body,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  height: 37,
}

const clearButtonStyle: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${theme.color.textMuted}`,
  color: theme.color.textMuted,
  borderRadius: 6,
  padding: '9px 16px',
  fontFamily: theme.font.body,
  fontSize: 13,
  cursor: 'pointer',
  height: 37,
}
