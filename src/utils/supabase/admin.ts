// src/utils/supabase/admin.ts
//
// SERVER-ONLY. Never import this from a 'use client' component or
// anything that could end up in the browser bundle — the service
// role key bypasses RLS entirely. Only Route Handlers and other
// server-only modules (like admin-users.server.ts) should import it.
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
