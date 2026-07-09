// app/properties/[id]/edit/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PropertyForm } from '@/components/PropertyForm'
import { theme } from '@/styles/theme'
import type { Property } from '@/types/database'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/properties/${id}/edit`)

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*, images:property_images(id, url, storage_path, is_primary, sort_order)')
    .eq('id', id)
    .single()

  if (error || !property) notFound()

  const canEdit = profile?.role === 'admin' || (profile?.role === 'agent' && property.agent_id === user.id)
  if (!canEdit) redirect(`/properties/${id}`)

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 26, marginBottom: 24 }}>
        Edit property
      </h1>
      <PropertyForm property={property as Property} />
    </main>
  )
}
