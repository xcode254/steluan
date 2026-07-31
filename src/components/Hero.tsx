// src/components/Hero.tsx
//
// Image + text overlay only. The search panel lives in SearchPanel.tsx
// and is placed by app/page.tsx into a two-column grid beside the
// sidebar — matching the target layout, where both overlap the hero's
// bottom edge rather than the panel spanning full width alone.
//
// No 'use client' needed: this has no interactivity left after the
// search form moved out.
import Image from 'next/image'
import { ShieldCheck, Users, Tag } from 'lucide-react'
import { theme } from '@/styles/theme'

export function Hero() {
  return (
    <div style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
      <Image
        src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1800&q=80"
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

      {/* Text sits in the upper portion so the pulled-up search panel
          below never covers it. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          maxWidth: theme.layout.maxWidth,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 48px 150px',
        }}
      >
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

        <h1 style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 46, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
          Find Your
          <br />
          Perfect Property
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: theme.font.body, fontSize: 15, marginTop: 12, maxWidth: 440 }}>
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
  )
}
