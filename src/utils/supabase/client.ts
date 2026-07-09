// src/utils/supabase/client.ts
// Browser client — use in Client Components ('use client')
// Replaces: createClientComponentClient from auth-helpers-nextjs
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
