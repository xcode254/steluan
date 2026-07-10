# Steluan LTD — Production Setup Guide

## Stack
- **Frontend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (self-hosted via Docker)
- **Reverse Proxy**: Nginx + TLS
- **Containerisation**: Docker + Docker Compose

---

## 1. Supabase Setup

### Option A — Supabase Cloud (easiest)
1. Create a project at https://supabase.com
2. Copy your Project URL and anon key into `.env.local`
3. Run migrations (step 3 below)

### Option B — Self-hosted Supabase
```bash
git clone https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env   # fill in secrets
docker compose up -d
```
Then point NEXT_PUBLIC_SUPABASE_URL at your server IP.

---

## 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values — see comments in .env.example
```

---

## 3. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations (runs 001, 002, 003 in order)
npm run db:migrate

# Seed development data
npm run db:seed

# Regenerate TypeScript types from live schema
npm run db:types
```

---

## 4. Configure Google OAuth

1. Go to Google Cloud Console → APIs → Credentials → Create OAuth 2.0 Client
2. Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
3. Copy Client ID + Secret into Supabase Dashboard → Auth → Providers → Google
4. Add to `.env.local` (for reference; auth itself is handled by Supabase)

---

## 5. Create Storage Bucket

In Supabase Dashboard → Storage → New Bucket:
- Name: `property-images`
- Public: **No** (we use signed URLs)
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Then run the storage policy SQL from the comments in `003_rls_policies.sql`.

---

## 6. Local Development

```bash
npm install
npm run dev
# App runs at http://localhost:3000
```

---

## 7. Production Deployment (Docker)

```bash
# Build
npm run docker:build

# Start (app + nginx)
npm run docker:up

# Tail logs
npm run docker:logs

# Stop
npm run docker:down
```

### TLS / HTTPS
Place your Let's Encrypt certificates in `docker/nginx/ssl/`:
```
docker/nginx/ssl/fullchain.pem
docker/nginx/ssl/privkey.pem
```

To auto-renew with Certbot:
```bash
certbot certonly --webroot -w /var/www/html -d steluan.co.ke
# Add a cron job: 0 3 * * * certbot renew --quiet && docker exec nginx nginx -s reload
```

---

## 8. RBAC Quick Reference

| Role   | Add | Edit own | Edit all | Delete | Manage Users |
|--------|-----|----------|----------|--------|--------------|
| admin  | ✅  | ✅       | ✅       | ✅     | ✅           |
| agent  | ✅  | ✅       | ❌       | ❌     | ❌           |
| viewer | ❌  | ❌       | ❌       | ❌     | ❌           |

To promote a user to agent/admin:
```sql
-- In Supabase SQL editor (as service role)
update public.profiles set role = 'agent' where id = '<user-uuid>';
```
Or use the Admin Dashboard in the app (admin login required).

---

## 9. npm Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start dev server (localhost:3000)    |
| `npm run build`      | Production build                     |
| `npm run type-check` | TypeScript check (no emit)           |
| `npm run test`       | Run unit tests (Vitest)              |
| `npm run test:e2e`   | Run E2E tests (Playwright)           |
| `npm run db:migrate` | Push SQL migrations to Supabase      |
| `npm run db:seed`    | Insert seed data                     |
| `npm run db:types`   | Regenerate TypeScript types from DB  |
| `npm run docker:up`  | Start production stack               |
| `npm run docker:logs`| Tail app container logs              |
