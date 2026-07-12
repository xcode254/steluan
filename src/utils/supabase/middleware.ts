// src/utils/supabase/middleware.ts
// Middleware client — refreshes sessions on every request
// Replaces: createMiddlewareClient from auth-helpers-nextjs
//
// @supabase/ssr / @supabase/supabase-js are pinned to exact versions
// in package.json — see the note in server.ts for why. The manual
// Cache-Control header below (withNoStore) is what actually fixes the
// CDN-caching-a-session-cookie bug; it does NOT depend on the ssr
// package version, which is why we don't need a newer one for that.
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '../../types/database'

// Vercel's edge network can cache a middleware response that carries
// a freshly-rotated session cookie, then serve that same cached
// response — with an already-invalidated refresh token — to the next
// request. That's what "works once, breaks on next navigation" is:
// the browser receives a stale Set-Cookie from cache, not a real one.
// @supabase/ssr v0.10.0+ passes cache headers to setAll automatically;
// below that (we're on 0.6.x) they must be set manually. Applying
// this unconditionally, on every response this function returns, is
// the documented fix — see:
// https://supabase.com/docs/guides/auth/server-side/advanced-guide#cdn-and-reverse-proxy-caching
function withNoStore<T extends NextResponse>(response: T): T {
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

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

  // Redirects must carry forward any cookies auth.getUser() just
  // refreshed onto supabaseResponse — a fresh NextResponse.redirect()
  // doesn't have them. Dropping a rotated session cookie here is what
  // breaks the session for everything downstream, including
  // client-side calls this middleware never even touches.
  function redirectWithFreshCookies(url: URL | string) {
    const redirect = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie)
    })
    return withNoStore(redirect)
  }

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
    return redirectWithFreshCookies(url)
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
      return redirectWithFreshCookies(new URL('/', request.url))
    }
  }

  return withNoStore(supabaseResponse)
}
