// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-users.server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)

  if (error) {
    // properties.agent_id has no ON DELETE clause (defaults to
    // RESTRICT), so Postgres blocks the cascade delete of the
    // profile row while that agent still owns listings.
    const isFkViolation = /foreign key constraint/i.test(error.message)
    const message = isFkViolation
      ? 'This user still has properties assigned to them. Reassign or delete those listings first, or suspend the account instead.'
      : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
