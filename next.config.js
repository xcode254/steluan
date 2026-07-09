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
};

module.exports = nextConfig;
