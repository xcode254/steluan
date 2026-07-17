// app/properties/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { PropertyGrid } from '@/components/PropertyGrid'
import { PropertyFilters } from '@/components/PropertyFilters'
import { Pagination } from '@/components/Pagination'
import { theme } from '@/styles/theme'
import type { Property } from '@/types/database'

const PAGE_SIZE = 20

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    type?: string
    category?: string
    location?: string
    minPrice?: string
    maxPrice?: string
    minBeds?: string
    sort?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const currentPage = Math.max(1, Number(params.page) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  // Fetch one extra row beyond the page size — its presence tells us
  // there's a next page, without a separate COUNT query just for that.
  const { data: rawResults, error } = await supabase.rpc('search_properties', {
    query:         params.q ?? '',
    prop_type:     params.type || null,
    prop_category: params.category || null,
    location_q:    params.location || null,
    min_price:     params.minPrice ? Number(params.minPrice) : null,
    max_price:     params.maxPrice ? Number(params.maxPrice) : null,
    min_beds:      params.minBeds  ? Number(params.minBeds)  : null,
    lim:  PAGE_SIZE + 1,
    offs: offset,
  })

  const hasNextPage = (rawResults?.length ?? 0) > PAGE_SIZE
  const properties = (rawResults ?? []).slice(0, PAGE_SIZE)

  // search_properties doesn't return the joined agent — fetch it separately
  // for the small set of results so PropertyCard can show the agent name.
  let withAgents: Property[] = properties
  if (properties.length) {
    const agentIds = [...new Set(properties.map((p: Property) => p.agent_id))]
    const { data: agents } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone, role')
      .in('id', agentIds)
    const agentMap = new Map((agents ?? []).map((a) => [a.id, a]))
    withAgents = properties.map((p: Property) => ({ ...p, agent: agentMap.get(p.agent_id) }))
  }

  // search_properties orders by relevance/date only — sorting by price
  // is done here on the already-filtered result set rather than adding
  // a sort param to the RPC, since result sets at this scale don't
  // need it done in SQL to stay fast.
  if (params.sort === 'price_asc') {
    withAgents = [...withAgents].sort((a, b) => a.price - b.price)
  } else if (params.sort === 'price_desc') {
    withAgents = [...withAgents].sort((a, b) => b.price - a.price)
  }

  const activeFilterParts = [
    params.category,
    params.location ? `in ${params.location}` : null,
    params.type,
    params.minPrice ? `from KES ${Number(params.minPrice).toLocaleString()}` : null,
    params.maxPrice ? `up to KES ${Number(params.maxPrice).toLocaleString()}` : null,
    params.minBeds ? `${params.minBeds}+ beds` : null,
  ].filter(Boolean)

  return (
    <main style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 32px' }}>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 26, marginBottom: 6 }}>
        All Properties
      </h1>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, marginBottom: 20 }}>
        {withAgents.length} listing{withAgents.length === 1 ? '' : 's'}
        {currentPage > 1 ? ` · page ${currentPage}` : ''}
        {activeFilterParts.length ? ` · ${activeFilterParts.join(' · ')}` : ''}
      </p>

      <Suspense fallback={null}>
        <PropertyFilters />
      </Suspense>

      {error ? (
        <div style={{ background: '#fdecec', color: theme.color.red, padding: 16, borderRadius: 8 }}>
          <strong>Database error:</strong> {error.message}
        </div>
      ) : (
        <>
          <PropertyGrid initialProperties={withAgents} />
          <Suspense fallback={null}>
            <Pagination currentPage={currentPage} hasNextPage={hasNextPage} />
          </Suspense>
        </>
      )}
    </main>
  )
}
