// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { listAllUsersWithAuth, type AdminUserRow } from '@/lib/admin-users.server'
import { Dashboard } from '@/components/Dashboard'
import type { Property, Profile, ViewingRequest } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  let propertiesQuery = supabase
    .from('properties')
    .select('*, agent:profiles!properties_agent_id_fkey(id, full_name, avatar_url, phone, role)')
    .order('created_at', { ascending: false })

  if (profile.role !== 'admin') {
    propertiesQuery = propertiesQuery.eq('agent_id', profile.id)
  }
  const { data: properties } = await propertiesQuery

  // Admin-only: pulls email + ban status from auth.users via the
  // service-role helper, merged with each profile's role/name.
  // Never exposed through the regular RLS-protected client queries.
  //
  // Deliberately caught rather than left to throw: this fetch hits
  // GoTrue's admin API over the network, and a failure or timeout
  // here should never block an admin from seeing the rest of their
  // dashboard (properties, stats, viewing requests) — it should just
  // degrade to an empty user list with an inline error instead.
  let allUsers: AdminUserRow[] = []
  let usersError: string | null = null
  if (profile.role === 'admin') {
    try {
      allUsers = await listAllUsersWithAuth()
    } catch (err) {
      usersError = err instanceof Error ? err.message : 'Could not load users.'
      console.error('[dashboard] listAllUsersWithAuth failed:', err)
    }
  }

  const propertyIds = (properties ?? []).map((p) => p.id)
  let viewingRequests: ViewingRequest[] = []
  if (propertyIds.length) {
    const { data } = await supabase
      .from('viewing_requests')
      .select('*, property:properties(id, name, primary_image, location)')
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false })
    viewingRequests = data ?? []
  }

  return (
    <Dashboard
      profile={profile as Profile}
      initialProperties={(properties as Property[]) ?? []}
      initialUsers={allUsers}
      usersError={usersError}
      initialViewingRequests={viewingRequests}
    />
  )
}
