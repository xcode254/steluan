# GitHub Repository Setup — Steluan LTD

---

## Step 1 — Create the repository

1. Go to https://github.com/new
2. Set:
   - Repository name: `steluan-ltd`
   - Visibility: **Private**
   - Do NOT initialise with README (you already have code)
3. Click **Create repository**

---

## Step 2 — Initialise git and push

Run in your project root on the Debian machine:

    cd /path/to/steluan
    git init
    git add .
    git commit -m "feat: initial Steluan LTD project scaffold"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/steluan-ltd.git
    git push -u origin main

---

## Step 3 — Create .gitignore

Make sure these are in your `.gitignore` before the first push:

    # Env files — NEVER commit these
    .env
    .env.local
    .env.production
    .dev.vars
    .dev.vars.*

    # Dependencies
    node_modules/
    .next/
    .open-next/

    # Supabase local
    supabase/.branches/
    supabase/.temp/

    # OS
    .DS_Store
    Thumbs.db

---

## Step 4 — Branch strategy

    main        → production  (protected, deploys to Cloudflare + prod Supabase)
    staging     → staging     (deploys to staging Supabase, staging Worker)
    feat/*      → feature branches (open PRs into staging)

Set up branch protection on `main`:
GitHub repo → Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass (add after CI is set up)
- ✅ Do not allow bypassing the above settings

---

## Step 5 — Add GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add ALL of these:

### Cloudflare secrets

| Secret name | Where to get it |
|-------------|----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → use "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → right sidebar |

### Supabase — Production secrets

| Secret name | Where to get it |
|-------------|----------------|
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens → Generate new token |
| `PROD_SUPABASE_PROJECT_ID` | Supabase dashboard URL: .../project/**this-part** |
| `PROD_SUPABASE_DB_PASSWORD` | Supabase → Project Settings → Database → Database password |
| `PROD_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `PROD_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `PROD_SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |

### Supabase — Staging secrets (separate Supabase project)

| Secret name | Value |
|-------------|-------|
| `STAGING_SUPABASE_PROJECT_ID` | Your staging project ID |
| `STAGING_SUPABASE_DB_PASSWORD` | Staging DB password |
| `STAGING_SUPABASE_URL` | Staging project URL |
| `STAGING_SUPABASE_ANON_KEY` | Staging anon key |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | Staging service role key |

> For self-hosted Supabase, use PROD_DATABASE_URL instead:
> `postgresql://postgres:PASSWORD@YOUR_SERVER_IP:5432/postgres`

---

## Step 6 — GitHub Actions workflows

See `.github/workflows/` in the project for the full CI/CD pipelines.
Summary of what runs:

| Trigger | Workflow | What it does |
|---------|----------|-------------|
| PR opened/updated | `ci.yml` | Type check, lint, unit tests |
| Push to `staging` | `deploy-staging.yml` | Deploy to staging Worker + migrate staging DB |
| Push to `main` | `deploy-production.yml` | Deploy to prod Worker + migrate prod DB |

---

## Step 7 — Verify setup

After pushing to main, go to:
GitHub repo → Actions tab

You should see the CI workflow running.
Green checkmark = all good.
Red X = click the workflow run to see the error log.

