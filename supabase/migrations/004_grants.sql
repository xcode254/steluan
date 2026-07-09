-- ============================================================
-- Steluan LTD — Baseline Grants
-- Migration: 004_grants.sql
--
-- RLS policies (003_rls_policies.sql) control WHICH ROWS a role can
-- see once it's allowed to touch a table at all. Without the coarser
-- table-level GRANTs below, Postgres denies access before RLS is
-- even evaluated — this is what causes "permission denied for table
-- properties". Supabase Cloud pre-wires these grants automatically
-- on every new project; a hand-rolled local/self-hosted migration
-- set does not, so we do it explicitly here.
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

-- service_role bypasses RLS entirely (used by SUPABASE_SERVICE_ROLE_KEY
-- in server-side/admin contexts) — needs full access at the grant layer
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- authenticated: base table-level grants. RLS policies from 003
-- still narrow this down per row and per role (agent/admin/viewer).
grant select, insert, update, delete on public.profiles          to authenticated;
grant select, insert, update, delete on public.properties        to authenticated;
grant select, insert, update, delete on public.property_images   to authenticated;
grant select, insert, update, delete on public.viewing_requests  to authenticated;
grant select                          on public.audit_log         to authenticated;

-- anon: public/unauthenticated browsing. RLS restricts properties
-- to active listings only (see "properties: public read active").
-- audit_log intentionally gets no grant at all — fully blocked.
grant select on public.profiles         to anon;
grant select on public.properties       to anon;
grant select on public.property_images  to anon;
grant insert on public.viewing_requests to anon;  -- public inquiry form

-- Sequences (e.g. audit_log.id bigserial) must be usable to insert
grant usage, select on all sequences in schema public to authenticated, anon;

-- Apply the same defaults automatically to any FUTURE tables created
-- by later migrations, so this doesn't need repeating each time.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

alter default privileges in schema public
  grant all on tables to service_role;
