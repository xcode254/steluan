-- ============================================================
-- Steluan LTD — Invite Role Support
-- Migration: 006_invite_role.sql
--
-- Lets an admin invite someone directly as an agent/admin instead
-- of everyone always starting as 'viewer'. The invite API route
-- passes intended_role via raw_user_meta_data; this trigger reads
-- it when the invited user completes signup.
--
-- Deliberately NOT adding an email column to public.profiles here.
-- The existing "profiles: public read" RLS policy is `using (true)`
-- — RLS can only restrict which ROWS are visible, not individual
-- columns within an allowed row. Since anon already has table-level
-- SELECT on profiles (migration 004), any email column added here
-- would be readable by anyone holding the public anon key. Emails
-- are fetched instead through a service-role, admin-only API route
-- that reads auth.users directly — see src/lib/admin-users.server.ts.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested_role user_role;
begin
  -- Only accept the hint if it's a valid enum value; anything else
  -- (or absent, for ordinary self-signups) falls back to 'viewer'.
  begin
    requested_role := (new.raw_user_meta_data->>'intended_role')::user_role;
  exception when others then
    requested_role := 'viewer';
  end;

  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(requested_role, 'viewer')
  );
  return new;
end;
$$;
