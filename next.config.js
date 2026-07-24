/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel supports Next.js Image Optimization natively — no
    // unoptimized flag needed here. (That flag was a Cloudflare
    // Workers-specific workaround from when that was the deploy
    // target; re-add `unoptimized: true` if you switch back.)
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  reactStrictMode: true,
  env: {
    // Baked into the client bundle at BUILD time — fixed for the
    // lifetime of that specific deployment's JS. Compared against
    // /api/version (which reflects whatever's CURRENTLY deployed,
    // evaluated at request time) to detect version skew: a browser
    // still running an older build's JS after a new deploy went
    // live. See src/components/VersionChecker.tsx.
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || `local-${Date.now()}`,
  },
};

module.exports = nextConfig;
