// src/components/PropertyCategories.tsx
//
// Uses only the categories that actually exist in the schema
// (house/apartment/land/commercial). The reference mockup showed
// "Townhouses" and "New Developments" too, but those aren't distinct
// category values we can query — townhouses aren't distinguished
// from houses, and "New Developments" is more of a tag/marketing
// concept than a property category. Real counts for real categories,
// rather than fabricated numbers for categories we can't back.
import Link from 'next/link'
import { Building, Home, Trees, Briefcase } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { theme } from '@/styles/theme'

const CATEGORIES = [
  { key: 'apartment', label: 'Apartments', icon: Building },
  { key: 'house',     label: 'Houses',     icon: Home },
  { key: 'land',      label: 'Land',       icon: Trees },
  { key: 'commercial', label: 'Commercial', icon: Briefcase },
] as const

export async function PropertyCategories() {
  const supabase = await createClient()

  const counts = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('category', cat.key)
      return count ?? 0
    })
  )

  return (
    <div style={{ marginTop: 56 }}>
      <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 22, marginBottom: 4 }}>
        Property Categories
      </h2>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 13, marginBottom: 20 }}>
        Find properties that match your needs
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.key}
            href={`/properties?category=${cat.key}`}
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: '18px 20px',
              boxShadow: theme.shadow.card,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ width: 42, height: 42, minWidth: 42, borderRadius: 8, background: '#fbf1e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <cat.icon size={20} color={theme.color.gold} />
            </div>
            <div>
              <div style={{ fontFamily: theme.font.body, fontWeight: 700, fontSize: 14, color: theme.color.navy }}>
                {cat.label}
              </div>
              <div style={{ fontFamily: theme.font.data, fontSize: 12, color: theme.color.textMuted }}>
                {counts[i]} {counts[i] === 1 ? 'Property' : 'Properties'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
