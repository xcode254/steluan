// src/utils/supabase/middleware.ts
// Middleware client — refreshes sessions on every request
// Replaces: createMiddlewareClient from auth-helpers-nextjs
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '../../types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT remove this call
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isDashboard   = path.startsWith('/dashboard')
  const isNewListing  = path === '/properties/new'
  const isEditListing = /^\/properties\/[^/]+\/edit$/.test(path)

  // Not logged in — bounce to login with a return path
  if (!user && (isDashboard || isNewListing || isEditListing)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Logged in but a viewer trying to list/edit a property — role check
  // happens again server-side on the page itself; this is a fast
  // edge-level bounce so viewers don't even see the form flash by.
  if (user && isNewListing) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role === 'viewer') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
