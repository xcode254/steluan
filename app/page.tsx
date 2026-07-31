// app/page.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Hero } from '@/components/Hero'
import { SearchPanel } from '@/components/SearchPanel'
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
    .limit(6)

  return (
    <main>
      <Hero />

      {/* Negative margin pulls this whole two-column block up over the
          hero's bottom edge — so the search panel AND the sidebar both
          overlap the image, side by side, as in the target layout. */}
      <div
        style={{
          maxWidth: theme.layout.maxWidth,
          margin: '-150px auto 0',
          padding: '0 48px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left column — ~79% at wide widths, matching the target's
              search-panel-to-sidebar ratio. */}
          <div style={{ flex: '3.8 1 620px', minWidth: 0 }}>
            <SearchPanel />

            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 22, margin: 0 }}>
                    Featured Properties
                  </h2>
                  <span style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted }}>
                    Handpicked by our team
                  </span>
                </div>
                <Link href="/properties" style={{ fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, color: theme.color.gold, whiteSpace: 'nowrap' }}>
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

            <div style={{ marginTop: 44 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 22, margin: 0 }}>
                    New Listings
                  </h2>
                  <span style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted }}>
                    Latest properties added
                  </span>
                </div>
                <Link href="/properties" style={{ fontFamily: theme.font.body, fontSize: 13, fontWeight: 700, color: theme.color.gold, whiteSpace: 'nowrap' }}>
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
          </div>

          {/* Right sidebar — starts level with the search panel */}
          <div style={{ flex: '1 1 280px', minWidth: 260 }}>
            <WhyChooseUs />
            <FindByLocation />
            <ListPropertyCTA />
          </div>
        </div>

        {/* Full-width below the two columns */}
        <PropertyCategories />
      </div>
    </main>
  )
}
