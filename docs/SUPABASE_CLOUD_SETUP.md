# Supabase Cloud Setup — Steluan LTD

Use this when you're ready to move off local Supabase to a real
hosted database. Create two projects: one for staging, one for production.

---

## Step 1 — Create a Supabase account

Go to https://supabase.com → Sign up (GitHub login is easiest).

---

## Step 2 — Create Production project

1. Click **New project**
2. Set:
   - Name: `steluan-production`
   - Database password: generate a strong one — **save it somewhere safe**
   - Region: **East Africa (Bahrain)** — closest to Kenya
   - Plan: Free (upgrade to Pro when you need >500MB DB or daily backups)
3. Click **Create new project** — takes ~2 minutes to provision

---

## Step 3 — Create Staging project

Repeat Step 2:
- Name: `steluan-staging`
- Use a different password
- Same region

> You need a separate project for staging — never point staging at
> the production database. A bad migration on staging should never
> touch production data.

---

## Step 4 — Get your project credentials

For EACH project (do this for both production and staging):

Go to: Project Settings (gear icon) → API

Copy and save:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

Go to: Project Settings → Database

Copy and save:
- **Database password** (the one you set in Step 2)
- **Connection string (URI)** → used for direct psql access

---

## Step 5 — Run migrations on Supabase Cloud

### Link your local CLI to production

    supabase login
    # Opens browser — log in with your Supabase account

    supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID
    # Get project ID from: dashboard URL → /project/THIS-PART

    # Push all 3 migration files
    supabase db push

### Link and migrate staging

    supabase link --project-ref YOUR_STAGING_PROJECT_ID
    supabase db push

---

## Step 6 — Create storage bucket on each project

In Supabase Dashboard (for EACH project):
Storage → New bucket:
- Name: `property-images`
- Public: off
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Then in SQL Editor, run the storage policies from `003_rls_policies.sql`
(the commented-out section at the bottom).

---

## Step 7 — Create your first admin user

In Supabase Dashboard → Authentication → Users → Add user:
- Email: your admin email
- Password: strong password
- Click **Create user**

Then promote them to admin in SQL Editor:

    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = (
      SELECT id FROM auth.users WHERE email = 'your@email.com'
    );

---

## Step 8 — Configure Google OAuth (optional)

### In Google Cloud Console:
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: **Web application**
5. Authorised redirect URIs — add BOTH:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - `https://YOUR_STAGING_REF.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret

### In Supabase Dashboard (both projects):
Authentication → Providers → Google:
- Enable: on
- Client ID: paste from Google
- Client Secret: paste from Google
- Save

---

## Step 9 — Configure email (production)

Supabase free tier uses a shared SMTP server with rate limits.
For production, set up your own SMTP:

Project Settings → Auth → SMTP Settings:
- Host: smtp.resend.com (recommended — free 3000 emails/month)
- Port: 465
- Username: resend
- Password: your Resend API key (get at https://resend.com)
- Sender email: noreply@steluan.co.ke

---

## Step 10 — Update .env.local for cloud

    NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...   # from Step 4
    SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...        # from Step 4
    NEXT_PUBLIC_APP_URL=https://steluan.co.ke

---

## Self-hosted Supabase on Debian (alternative to Cloud)

If you want Supabase running on your own Debian server instead:

    # On the Debian server
    git clone --depth 1 https://github.com/supabase/supabase
    cd supabase/docker

    cp .env.example .env

    # Generate required secrets
    openssl rand -base64 48   # → SECRET_KEY_BASE (64+ chars)
    openssl rand -hex 16      # → VAULT_ENC_KEY (32 chars)
    openssl rand -base64 24   # → PG_META_CRYPTO_KEY (32+ chars)
    openssl rand -base64 24   # → LOGFLARE_PUBLIC_ACCESS_TOKEN
    openssl rand -base64 24   # → LOGFLARE_PRIVATE_ACCESS_TOKEN
    openssl rand -hex 32      # → S3_PROTOCOL_ACCESS_KEY_SECRET

Edit `.env` and fill in ALL generated secrets. Then:

    docker compose up -d

Supabase Studio will be at http://YOUR_SERVER_IP:8000
Set a strong DASHBOARD_PASSWORD in .env before starting.

> For self-hosted migrations in CI/CD, use direct psql instead of
> supabase db push (the CLI can't link to self-hosted instances).
> See the GitHub Actions workflow for the psql approach.

