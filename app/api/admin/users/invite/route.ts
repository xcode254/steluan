// app/api/admin/users/invite/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-users.server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const email    = body?.email?.trim()
  const fullName = body?.fullName?.trim()
  const role     = body?.role ?? 'viewer'

  if (!email || !fullName) {
    return NextResponse.json({ error: 'Email and full name are required.' }, { status: 400 })
  }
  if (!['viewer', 'agent', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, intended_role: role },
  })

  if (error) {
    const msg = /already been registered|already exists/i.test(error.message)
      ? 'A user with that email already exists.'
      : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return NextResponse.json({ user: data.user })
}
