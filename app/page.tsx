// app/page.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Hero } from '@/components/Hero'
import { PropertyGrid } from '@/components/PropertyGrid'
import { WhyChooseUs } from '@/components/WhyChooseUs'
import { FindByLocation } from '@/components/FindByLocation'
import { ListPropertyCTA } from '@/components/ListPropertyCTA'
import { PropertyCategories } from '@/components/PropertyCategories'
import { theme } from '@/styles/theme'
import type { Property } from '@/types/database'

const PROPERTY_SELECT = `
  *,
  agent:profiles!properties_agent_id_fkey (id, full_name, avatar_url, phone, role)
`

export default async function HomePage() {
  const supabase = await createClient()

  // Featured and New Listings map onto the existing tag column
  // ('Featured' / 'New' / 'Hot') rather than arbitrary ordering —
  // real filters, not just "first N rows twice".
  const { data: featured, error: featuredError } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('status', 'active')
    .eq('tag', 'Featured')
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: newListings, error: newError } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <main>
      <Hero />

      <div style={{ maxWidth: theme.layout.maxWidth, margin: '0 auto', padding: '48px 32px 20px' }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '3 1 600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 22, margin: 0 }}>
                Featured Properties
              </h2>
              <Link href="/properties" style={{ fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, color: theme.color.gold, display: 'flex', alignItems: 'center', gap: 4 }}>
                View All →
              </Link>
            </div>

            {featuredError ? (
              <div style={{ background: '#fdecec', color: theme.color.red, padding: 16, borderRadius: 8 }}>
                <strong>Database error:</strong> {featuredError.message}
              </div>
            ) : (
              <PropertyGrid initialProperties={(featured as Property[]) ?? []} showViewToggle={false} />
            )}
          </div>

          <div style={{ flex: '1 1 280px', minWidth: 260 }}>
            <WhyChooseUs />
            <FindByLocation />
            <ListPropertyCTA />
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 22, margin: 0 }}>
              New Listings
            </h2>
            <Link href="/properties" style={{ fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, color: theme.color.gold, display: 'flex', alignItems: 'center', gap: 4 }}>
              View All →
            </Link>
          </div>

          {newError ? (
            <div style={{ background: '#fdecec', color: theme.color.red, padding: 16, borderRadius: 8 }}>
              <strong>Database error:</strong> {newError.message}
            </div>
          ) : (
            <PropertyGrid initialProperties={(newListings as Property[]) ?? []} showViewToggle={false} />
          )}
        </div>

        <PropertyCategories />
      </div>
    </main>
  )
}
