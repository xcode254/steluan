-- ============================================================
-- Steluan LTD — Property Category (adds Land listings)
-- Migration: 005_property_category.sql
--
-- Adds a `category` column separate from `type` (For Sale / For
-- Rent, which is the transaction kind). Category describes WHAT
-- is being listed: house, apartment, land, or commercial. Land
-- listings don't have bedrooms/bathrooms — those columns stay
-- NOT NULL for simplicity (default 0) and the frontend hides them
-- for the 'land' category rather than loosening the constraint.
-- ============================================================

create type property_category as enum ('house', 'apartment', 'land', 'commercial');

alter table public.properties
  add column category property_category not null default 'house';

-- Existing seeded rows are all houses — explicit for clarity
update public.properties set category = 'house' where category is null;

create index idx_properties_category on public.properties (category);

-- ── Extend search_properties to filter by category ────────────
-- Replaces the migration 002 version; same name/behavior plus
-- an optional category filter.
create or replace function public.search_properties(
  query        text      default '',
  prop_type    text      default null,
  prop_category text     default null,
  min_price    numeric   default null,
  max_price    numeric   default null,
  min_beds     int       default null,
  location_q   text      default null,
  lim          int       default 20,
  offs         int       default 0
)
returns setof public.properties
language sql stable as $$
  select p.* from public.properties p
  where
    p.status = 'active'
    and (query         = '' or p.search_vector @@ plainto_tsquery('english', query))
    and (prop_type      is null or p.type::text = prop_type)
    and (prop_category  is null or p.category::text = prop_category)
    and (min_price      is null or p.price >= min_price)
    and (max_price      is null or p.price <= max_price)
    and (min_beds       is null or p.beds  >= min_beds)
    and (location_q     is null or p.location ilike '%' || location_q || '%')
  order by
    case when query <> '' then ts_rank(p.search_vector, plainto_tsquery('english', query)) end desc nulls last,
    p.created_at desc
  limit lim offset offs;
$$;
