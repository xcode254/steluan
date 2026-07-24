// app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { Hero } from '@/components/Hero'
import { PropertyGrid } from '@/components/PropertyGrid'
import { theme } from '@/styles/theme'
import type { Property } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      *,
      agent:profiles!properties_agent_id_fkey (id, full_name, avatar_url, phone, role)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  // Real counts for the trust strip in Hero — not decorative
  // placeholder numbers. head:true skips fetching rows, just the count.
  const { count: listingCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: agentCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('role', ['agent', 'admin'])

  return (
    <main>
      <Hero listingCount={listingCount ?? 0} agentCount={agentCount ?? 0} />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 32px 40px' }}>
        <h2 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 24, marginBottom: 22 }}>
          Featured Properties
        </h2>

        {error ? (
          <div style={{ background: '#fdecec', color: theme.color.red, padding: 16, borderRadius: 8 }}>
            <strong>Database error:</strong> {error.message}
          </div>
        ) : (
          <PropertyGrid initialProperties={(properties as Property[]) ?? []} />
        )}
      </div>
    </main>
  )
}
