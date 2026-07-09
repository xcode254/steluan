// app/api/admin/users/[id]/unsuspend/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-users.server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: 'none' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
