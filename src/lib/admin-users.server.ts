// src/lib/admin-users.server.ts
//
// SERVER-ONLY. Used by app/dashboard/page.tsx (direct function call,
// no HTTP round trip needed since it's already a Server Component)
// and by the app/api/admin/users/* Route Handlers (which need it
// over HTTP since they're invoked from the client-side Dashboard).
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import type { UserRole } from '@/types/database'

export class AdminAuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Converts a call that might hang indefinitely (a stuck GoTrue admin
// API request, a flaky container) into a fast, clear failure instead.
// A timeout is strictly better than a hang: the caller gets a real
// error it can catch and degrade around, rather than a page that
// never finishes rendering.
// Accepts PromiseLike, not just Promise — Supabase's query builders
// (e.g. admin.from('profiles').select(...)) are "thenables" that work
// fine with await, but aren't nominally typed as Promise<T>. Requiring
// Promise<T> here made generic inference silently fall back to
// `unknown` for those calls specifically, while plain async-function
// calls like auth.admin.listUsers() inferred correctly — PromiseLike
// is the interface both actually satisfy.
function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms — is the local Supabase Auth container healthy? Try: docker ps, then supabase stop && supabase start`)), ms)
    ),
  ])
}

// Throws AdminAuthError (401/403) if the current session isn't an
// admin. Every mutation route calls this first — never trust a role
// claim coming from the client itself.
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await withTimeout(supabase.auth.getUser(), 8000, 'auth.getUser')
  if (!user) throw new AdminAuthError('You must be logged in.', 401)

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    throw new AdminAuthError('Admin access required.', 403)
  }
  return user
}

export interface AdminUserRow {
  id:               string
  email:            string | null
  full_name:        string
  role:             UserRole
  is_suspended:     boolean
  created_at:       string
  last_sign_in_at:  string | null
}

// Merges auth.users (email, ban status, timestamps — only visible
// via the service-role admin API) with public.profiles (role,
// full_name — the app's own data). Never expose auth.users directly
// to the client; this is the one sanctioned seam between them.
export async function listAllUsersWithAuth(): Promise<AdminUserRow[]> {
  const admin = createAdminClient()

  const { data: authList, error: authErr } = await withTimeout(
    admin.auth.admin.listUsers({ perPage: 1000 }),
    8000,
    'auth.admin.listUsers'
  )
  if (authErr) throw authErr

  const { data: profiles, error: profErr } = await withTimeout(
    admin.from('profiles').select('id, full_name, role'),
    8000,
    'profiles query'
  )
  if (profErr) throw profErr

  const profileMap = new Map(profiles.map((p) => [p.id, p]))

  return authList.users
    .map((u) => {
      const profile = profileMap.get(u.id)
      const isSuspended = !!u.banned_until && new Date(u.banned_until) > new Date()
      return {
        id: u.id,
        email: u.email ?? null,
        full_name: profile?.full_name ?? u.email?.split('@')[0] ?? 'Unknown',
        role: profile?.role ?? 'viewer',
        is_suspended: isSuspended,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
