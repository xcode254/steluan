# Vercel Deployment — Steluan LTD

Vercel is the native Next.js host — built by the same team, zero
adapters, zero version requirements. Unlike the Cloudflare path
(deferred — needs Next.js 15+), this works today on Next 14.2.20
exactly as the project stands.

---

## Before you start — Supabase must be public

Your Supabase instance has been running locally (`localhost:54321`)
this whole time. Vercel's servers can't reach your machine's
localhost, so Supabase needs a real public URL first. Two options:

**Option A — Supabase Cloud (recommended, simplest)**
Follow `docs/SUPABASE_CLOUD_SETUP.md` if you haven't already — create
a project, run the 6 migrations, seed data, create your admin user.
Takes about 15 minutes and this is by far the most common Vercel +
Supabase pairing.

**Option B — Keep self-hosting**
Expose your Debian box's Supabase stack publicly with a real domain
and TLS (the `docker/nginx/` setup from earlier already does this).
Point Vercel's env vars at that public URL instead of Supabase Cloud's.

Everything below assumes you have a Supabase URL that isn't
`localhost` — from either option.

---

## 1. Install the Vercel CLI

No need to add this as a project dependency — run it via `npx` so it
never touches `package.json` or risks another dependency-resolution
conflict:

    npx vercel --version

(First run downloads it once; subsequent `npx vercel` calls are fast.)

---

## 2. Log in

    npx vercel login

Opens a browser to authenticate with your Vercel account (or creates
one — free tier is generous for a project this size).

---

## 3. Link the project

From your project root:

    npx vercel link

Answer the prompts:
- Set up and deploy? → No (we'll do env vars first)
- Which scope? → your account/team
- Link to existing project? → No (unless you already created one in
  the dashboard)
- Project name → steluan-ltd (or whatever you prefer)

This creates a `.vercel/` folder locally linking your code to a
Vercel project. Already covered by `.gitignore` — never commit it.

---

## 4. Set environment variables

Go to your new project in the Vercel dashboard →
**Settings → Environment Variables**, and add each of these for
**Production**, **Preview**, and **Development**:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL | public — bundled into the browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key | public — bundled into the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key | **server-only** — no `NEXT_PUBLIC_` prefix, never exposed to the browser |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` (or custom domain once set up) | |

> The service role key is what powers the admin user-management API
> routes (`/api/admin/users/*`). Get this wrong and invite/suspend/
> delete will fail — but regular browsing and login are unaffected,
> since those never touch the service-role client.

After adding variables, **you must redeploy** for them to take
effect — Vercel doesn't hot-reload env var changes into a running
deployment.

---

## 5. Deploy

**First deploy (preview):**

    npx vercel

**Production deploy:**

    npx vercel --prod

Either way, Vercel runs `npm install` then `next build` automatically
— no custom build config needed for a standard Next.js app.

---

## 6. Connect GitHub for automatic deployments (recommended)

Rather than manually running `vercel --prod` every time, connect the
repo directly:

1. Vercel Dashboard → your project → **Settings → Git**
2. Connect your GitHub repository
3. From then on:
   - Push to `main` → automatic **production** deployment
   - Open a PR / push to any other branch → automatic **preview**
     deployment with its own unique URL, perfect for testing before
     merging

This replaces the need for a custom GitHub Actions deploy workflow
entirely — Vercel's own Git integration handles build, preview, and
production promotion natively, and does it better than a hand-rolled
Action could. Your existing `.github/workflows/ci.yml` (lint,
type-check, unit tests) keeps running on every PR exactly as before,
alongside Vercel's own preview build — they're complementary, not
duplicated effort.

---

## 7. Custom domain (optional)

Vercel Dashboard → your project → **Settings → Domains** → add your
domain (e.g. `steluan.co.ke`). Vercel gives you the DNS records to
add (usually a CNAME), and provisions TLS automatically once DNS
propagates — typically minutes, occasionally up to 24 hours.

Update `NEXT_PUBLIC_APP_URL` to match once the domain is live, and
redeploy.

---

## 8. Verify middleware works correctly

`middleware.ts` runs on Vercel's Edge Runtime by default. The
`@supabase/ssr` package used throughout this project (`src/utils/
supabase/middleware.ts`) is specifically built to work in exactly
this environment — no changes needed. After your first deploy, test:

- Visiting `/dashboard` while logged out → should redirect to `/login`
- Visiting `/properties/new` as a viewer → should redirect to `/`
- Logging in → session should persist across page loads

---

## Troubleshooting

**Build fails with a Supabase-related error**
Double check all 4 env vars are set for the environment you're
deploying to (Production vs Preview are separate — a var set only in
Production won't be there for a PR preview build).

**"Database error" or blank data after deploy**
Confirm migrations actually ran against whichever Supabase instance
Vercel is pointed at. Local `supabase db reset` only affects your
local Docker stack — it has no effect on Supabase Cloud or a
separate self-hosted instance. Run `supabase db push` against the
linked remote project instead (see `docs/SUPABASE_CLOUD_SETUP.md`).

**Admin invite/suspend/delete returns 500**
Almost always a missing or mistyped `SUPABASE_SERVICE_ROLE_KEY` in
the Vercel dashboard for that environment. Re-check it, redeploy.

**Images not loading**
`next.config.js` restricts `remotePatterns` to `images.unsplash.com`
and `*.supabase.co`. If you're using a different Storage domain or
image source, add it there.
