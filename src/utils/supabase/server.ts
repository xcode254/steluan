// src/utils/supabase/server.ts
// Server client — use in Server Components, Server Actions, Route Handlers
// Replaces: createServerComponentClient / createRouteHandlerClient from auth-helpers-nextjs
//
// @supabase/ssr and @supabase/supabase-js are pinned to EXACT versions
// (0.6.1 / 2.49.4) in package.json, deliberately without ^ or ~. Newer
// combinations (confirmed: supabase-js 2.74.0+ with various ssr
// versions) have an active upstream type-inference bug where every
// query result resolves to `never`, even with correctly CLI-generated
// Database types — see supabase/supabase-js#1738. Don't bump either
// package without checking that issue is actually resolved upstream.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie setting is a no-op here.
            // Middleware handles session refresh instead.
          }
        },
      },
    }
  )
}
