-- ============================================================
-- Steluan LTD — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
-- Supabase installs extensions into a dedicated `extensions` schema
-- rather than `public`. "already exists, skipping" on uuid-ossp just
-- means it's already there — it does NOT mean it's on the search
-- path, so unqualified calls to its functions (and pg_trgm's
-- gin_trgm_ops operator class below) fail to resolve unless we
-- explicitly widen search_path for this session.
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";
set search_path = public, extensions;

-- Postgres 13+ ships gen_random_uuid() built in — no extension (and
-- so no schema-resolution issue) needed at all. Using this instead
-- of uuid-ossp's uuid_generate_v4() sidesteps the problem above
-- entirely rather than just working around it.

-- ── Enum types ────────────────────────────────────────────────
create type user_role       as enum ('admin', 'agent', 'viewer');
create type property_status as enum ('active', 'sold', 'rented', 'archived');
create type property_type   as enum ('For Sale', 'For Rent');
create type property_tag    as enum ('Featured', 'New', 'Hot');
create type viewing_status  as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- ── profiles (extends auth.users) ────────────────────────────
create table public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  full_name   text        not null,
  avatar_url  text,
  phone       text,
  role        user_role   not null default 'viewer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── properties ────────────────────────────────────────────────
create table public.properties (
  id            uuid            primary key default gen_random_uuid(),
  agent_id      uuid            not null references public.profiles (id),
  name          text            not null,
  description   text,
  price         numeric(15, 2)  not null check (price > 0),
  currency      text            not null default 'KES',
  type          property_type   not null default 'For Sale',
  tag           property_tag    not null default 'Featured',
  status        property_status not null default 'active',
  beds          smallint        not null check (beds >= 0),
  baths         smallint        not null check (baths >= 0),
  sqm           numeric(10, 2)  not null check (sqm > 0),
  location      text            not null,
  latitude      numeric(9, 6),
  longitude     numeric(9, 6),
  amenities     text[]          not null default '{}',
  primary_image text,
  search_vector tsvector,
  created_at    timestamptz     not null default now(),
  updated_at    timestamptz     not null default now()
);

-- ── property_images ───────────────────────────────────────────
create table public.property_images (
  id           uuid        primary key default gen_random_uuid(),
  property_id  uuid        not null references public.properties (id) on delete cascade,
  url          text        not null,
  storage_path text        not null,
  is_primary   boolean     not null default false,
  sort_order   smallint    not null default 0,
  uploaded_by  uuid        not null references public.profiles (id),
  created_at   timestamptz not null default now()
);

create unique index uq_primary_image
  on public.property_images (property_id)
  where is_primary = true;

-- ── viewing_requests ──────────────────────────────────────────
create table public.viewing_requests (
  id            uuid           primary key default gen_random_uuid(),
  property_id   uuid           not null references public.properties (id) on delete cascade,
  requester_id  uuid           references public.profiles (id) on delete set null,
  contact_name  text           not null,
  contact_email text           not null,
  contact_phone text,
  preferred_at  timestamptz,
  message       text,
  status        viewing_status not null default 'pending',
  agent_notes   text,
  created_at    timestamptz    not null default now(),
  updated_at    timestamptz    not null default now()
);

-- ── audit_log ─────────────────────────────────────────────────
create table public.audit_log (
  id          bigserial   primary key,
  actor_id    uuid        references public.profiles (id) on delete set null,
  action      text        not null,
  table_name  text        not null,
  record_id   text        not null,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index idx_properties_agent      on public.properties (agent_id);
create index idx_properties_status     on public.properties (status);
create index idx_properties_type       on public.properties (type);
create index idx_properties_location   on public.properties using gin (location gin_trgm_ops);
create index idx_properties_search     on public.properties using gin (search_vector);
create index idx_property_images_prop  on public.property_images (property_id);
create index idx_viewing_requests_prop on public.viewing_requests (property_id);
create index idx_audit_log_actor       on public.audit_log (actor_id);
create index idx_audit_log_record      on public.audit_log (table_name, record_id);
