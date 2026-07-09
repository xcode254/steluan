// app/properties/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PropertyDetailView } from '@/components/PropertyDetailView'
import type { Property } from '@/types/database'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      agent:profiles!properties_agent_id_fkey (id, full_name, avatar_url, phone, role),
      images:property_images (id, url, storage_path, is_primary, sort_order)
    `)
    .eq('id', id)
    .single()

  if (error || !property) notFound()

  // Similar Properties — same category, still active, excluding this one.
  // Falls back to no section at all if nothing else matches; never errors
  // the whole page over what's a "nice to have" row.
  const { data: similar } = await supabase
    .from('properties')
    .select(`
      *,
      agent:profiles!properties_agent_id_fkey (id, full_name, avatar_url, phone, role)
    `)
    .eq('category', property.category)
    .eq('status', 'active')
    .neq('id', id)
    .limit(4)

  return (
    <PropertyDetailView
      property={property as Property}
      similarProperties={(similar as Property[]) ?? []}
    />
  )
}
