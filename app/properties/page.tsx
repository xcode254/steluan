// app/properties/page.tsx
import { createClient } from '@/utils/supabase/server'
import { PropertyGrid } from '@/components/PropertyGrid'
import { theme } from '@/styles/theme'
import type { Property } from '@/types/database'

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; category?: string; location?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: properties, error } = await supabase.rpc('search_properties', {
    query:         params.q ?? '',
    prop_type:     params.type || null,
    prop_category: params.category || null,
    location_q:    params.location || null,
    lim:  50,
    offs: 0,
  })

  // search_properties doesn't return the joined agent — fetch it separately
  // for the small set of results so PropertyCard can show the agent name.
  let withAgents: Property[] = properties ?? []
  if (properties?.length) {
    const agentIds = [...new Set(properties.map((p: Property) => p.agent_id))]
    const { data: agents } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone, role')
      .in('id', agentIds)
    const agentMap = new Map((agents ?? []).map((a) => [a.id, a]))
    withAgents = properties.map((p: Property) => ({ ...p, agent: agentMap.get(p.agent_id) }))
  }

  return (
    <main style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 32px' }}>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 26, marginBottom: 6 }}>
        All Properties
      </h1>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, marginBottom: 28 }}>
        {withAgents.length} listing{withAgents.length === 1 ? '' : 's'}
        {params.category ? ` · ${params.category}` : ''}
        {params.location ? ` in ${params.location}` : ''}
        {params.type ? ` · ${params.type}` : ''}
      </p>

      {error ? (
        <div style={{ background: '#fdecec', color: theme.color.red, padding: 16, borderRadius: 8 }}>
          <strong>Database error:</strong> {error.message}
        </div>
      ) : (
        <PropertyGrid initialProperties={withAgents} />
      )}
    </main>
  )
}
