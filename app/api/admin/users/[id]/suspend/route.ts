// app/api/admin/users/[id]/suspend/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-users.server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let currentAdminId: string
  try {
    currentAdminId = (await requireAdmin()).id
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }

  if (id === currentAdminId) {
    return NextResponse.json({ error: "You can't suspend your own account." }, { status: 400 })
  }

  const admin = createAdminClient()
  // ~10 years — effectively indefinite until explicitly unsuspended
  const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: '87600h' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
