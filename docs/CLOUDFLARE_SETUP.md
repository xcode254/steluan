# Cloudflare Workers Setup — Steluan LTD

> ⚠️ **DEFERRED — requires Next.js 15+.** `@opennextjs/cloudflare`
> dropped Next.js 14 support (Cloudflare's own docs confirm Next 14
> support was dropped Q1 2026). Steluan currently runs on Next 14.2.20
> and `@opennextjs/cloudflare` / `wrangler` were deliberately removed
> from `package.json` to keep `npm install` working. Do not add them
> back until Steluan has been upgraded to Next.js 15.5.18+ or 16.2.6+
> — that upgrade should be its own planned migration, not a side
> effect of chasing a peer-dependency error. Everything below is
> accurate for when that migration happens.

Deploys the Next.js app to Cloudflare's global edge network using
the OpenNext adapter. Free tier: 100,000 requests/day.

---

## Prerequisites

- Cloudflare account: https://dash.cloudflare.com/sign-up (free)
- Wrangler CLI installed (step 1 below)
- Supabase project already running (cloud or self-hosted)
- GitHub repo with your Steluan code
- **Next.js upgraded to 15.5.18+ or 16.2.6+** (see deferred note above)

---

## Step 1 — Install Wrangler CLI

    npm install -g wrangler

Verify:

    wrangler --version

---

## Step 2 — Add OpenNext adapter to the project

    npm install @opennextjs/cloudflare
    npm install -D wrangler

---

## Step 3 — Create OpenNext config

Create `open-next.config.ts` in the project root:

    import { defineCloudflareConfig } from "@opennextjs/cloudflare";
    export default defineCloudflareConfig({});

---

## Step 4 — Create Wrangler config

Create `wrangler.jsonc` in the project root:

    {
      "$schema": "node_modules/wrangler/config-schema.json",
      "name": "steluan-ltd",
      "compatibility_flags": ["nodejs_compat"],
      "compatibility_date": "2025-04-01",
      "assets": {
        "directory": ".open-next/assets",
        "binding": "ASSETS"
      },
      "main": ".open-next/worker.js",
      "observability": {
        "enabled": true
      }
    }

> IMPORTANT: Set compatibility_date to 2025-04-01 or later.
> Earlier dates cause process.env to be empty at runtime — Zod
> validation fails silently and the app breaks in production.

---

## Step 5 — Update next.config.js

    /** @type {import('next').NextConfig} */
    const nextConfig = {
      images: {
        // Cloudflare Workers don't support Next.js image optimization natively
        // Use Cloudflare Images or unoptimized for now
        unoptimized: true,
      },
    };

    // Dev only: init OpenNext for local Workers preview
    if (process.env.NODE_ENV !== "production") {
      const { initOpenNextCloudflareForDev } = await import(
        "@opennextjs/cloudflare"
      );
      initOpenNextCloudflareForDev();
    }

    export default nextConfig;

> IMPORTANT: Do NOT set output: "export" — Workers needs the full
> Next.js build, not a static export.
> Remove any `export const runtime = 'edge'` from route files —
> @opennextjs/cloudflare handles the runtime itself.

---

## Step 6 — Add deploy scripts to package.json

Add these under "scripts":

    "preview:cf":  "npx @opennextjs/cloudflare build && wrangler dev",
    "deploy:cf":   "npx @opennextjs/cloudflare build && wrangler deploy",
    "deploy:cf:staging": "npx @opennextjs/cloudflare build && wrangler deploy --env staging"

---

## Step 7 — Set up environment variables in Cloudflare

Cloudflare Workers use `.dev.vars` locally (not `.env.local`).

Create `.dev.vars` in project root (git-ignored):

    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
    SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

Add `.dev.vars` to `.gitignore`:

    echo ".dev.vars" >> .gitignore

For production, set secrets via Wrangler CLI:

    wrangler secret put NEXT_PUBLIC_SUPABASE_URL
    wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
    wrangler secret put SUPABASE_SERVICE_ROLE_KEY

Or set them in the Cloudflare dashboard:
Workers & Pages → steluan-ltd → Settings → Variables and Secrets

---

## Step 8 — Log in to Cloudflare

    wrangler login

This opens a browser to authenticate. Your token is saved locally.

---

## Step 9 — Preview locally in Workers runtime

    npm run preview:cf

Opens at http://localhost:8787
This runs in the actual Workers (workerd) runtime — more accurate
than `npm run dev` for catching Workers-specific issues.

---

## Step 10 — Deploy to Cloudflare

    npm run deploy:cf

First deploy outputs your Workers URL:
    https://steluan-ltd.<your-subdomain>.workers.dev

---

## Step 11 — Add a custom domain (optional)

In Cloudflare Dashboard:
1. Workers & Pages → steluan-ltd → Settings → Domains & Routes
2. Add Route → enter your domain (e.g., steluan.co.ke)
3. Cloudflare automatically handles SSL/TLS

---

## Known limitations on Workers

| Feature | Status | Workaround |
|---------|--------|-----------|
| `cookies()` from next/headers in middleware | Node.js only | Use `req.cookies.get()` directly on NextRequest |
| `export const runtime = 'edge'` | Not supported | Remove it — adapter handles runtime |
| Next.js Image Optimization | Not native | Set `unoptimized: true` or use Cloudflare Images |
| Filesystem access at runtime | None | Use Supabase Storage for all files |
| Bundle size | 3MB free / 10MB paid | Audit server imports; avoid heavy server-side libs |

---

## Free tier limits

| Resource | Free | Paid ($5/mo) |
|----------|------|--------------|
| Requests/day | 100,000 | 10M/month |
| Bundle size | 3 MB gzip | 10 MB gzip |
| CPU time/request | 10ms | 30s |
| Subrequests/request | 50 | 1000 |

For Steluan in early stage, free tier is sufficient.

