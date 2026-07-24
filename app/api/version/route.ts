// app/api/version/route.ts
//
// Evaluated at request time on the server, so it always reflects
// whatever is CURRENTLY deployed — unlike NEXT_PUBLIC_BUILD_ID
// (next.config.js), which is frozen into a client's JS bundle at the
// moment that specific build ran. Comparing the two is how
// VersionChecker detects a client running stale code after a deploy.
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'local' },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
