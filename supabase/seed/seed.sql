-- ============================================================
-- Steluan LTD — Seed Data (development only)
-- Run: supabase db seed  (or paste into SQL editor)
--
-- IMPORTANT: auth.users rows are created FIRST. The
-- handle_new_user trigger (migration 002) then auto-creates
-- matching public.profiles rows. Never insert into profiles
-- directly before its referenced auth.users row exists —
-- that violates the profiles_id_fkey constraint.
-- ============================================================

-- ── 1. Create auth users ────────────────────────────────────
-- confirmation_token, recovery_token, and the other *_token /
-- *_change columns below MUST be '' rather than NULL. GoTrue scans
-- them as non-nullable strings on every login; a NULL here causes
-- "Database error querying schema" (a wrapped Go sql.Scan error) —
-- see https://github.com/supabase/auth/issues/1940
insert into auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role,
  confirmation_token, recovery_token, email_change_token_new,
  email_change, email_change_token_current, phone_change,
  phone_change_token, reauthentication_token
) values
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000',
   'admin@steluan.co.ke', crypt('admin123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Admin Alice"}', 'authenticated', 'authenticated',
   '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000000',
   'moris@steluan.co.ke', crypt('agent123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Agent Moris"}', 'authenticated', 'authenticated',
   '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000000',
   'amina@steluan.co.ke', crypt('agent456', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Agent Amina"}', 'authenticated', 'authenticated',
   '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000000',
   'viewer@steluan.co.ke', crypt('view123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Viewer Viewer"}', 'authenticated', 'authenticated',
   '', '', '', '', '', '', '', '')
on conflict (id) do nothing;

-- ── 2. Promote roles ─────────────────────────────────────────
-- The trigger creates profiles with role='viewer' by default.
-- Promote admin and agents here.
update public.profiles set role = 'admin'
  where id = '00000000-0000-0000-0000-000000000001';

update public.profiles set role = 'agent'
  where id = '00000000-0000-0000-0000-000000000002';

update public.profiles set role = 'agent'
  where id = '00000000-0000-0000-0000-000000000003';

-- viewer stays at default 'viewer' — no update needed

-- ── 3. Create storage bucket ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images', 'property-images', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- ── 4. Seed sample properties ────────────────────────────────
insert into public.properties
  (id, agent_id, name, description, price, type, category, tag, beds, baths, sqm, location, latitude, longitude, amenities, primary_image)
values
  (
    'a1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Water Luxury Villa',
    'A stunning waterfront villa with panoramic views of the Nairobi skyline. Features an infinity pool, smart home system, and landscaped gardens.',
    5250000, 'For Sale', 'house', 'Featured', 5, 4, 1300,
    'Karen, Nairobi', -1.3167, 36.7167,
    array['Swimming Pool', 'Balcony', '24/7 Security', 'Smart Home', 'Garden'],
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Modern Estate',
    'Contemporary 4-bedroom estate in the heart of Westlands. Open-plan living, designer kitchen, and rooftop terrace with city views.',
    5250000, 'For Sale', 'house', 'Featured', 4, 3, 980,
    'Westlands, Nairobi', -1.2637, 36.8029,
    array['Rooftop Terrace', 'Gym', 'Concierge', 'Underground Parking'],
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Luxury Penthouse',
    'Top-floor penthouse in a premium Mombasa development. Sea views from every room, private elevator, and wrap-around terrace.',
    3200000, 'For Rent', 'apartment', 'New', 3, 2, 560,
    'Nyali, Mombasa', -4.0200, 39.7200,
    array['Sea View', 'Private Elevator', 'Wrap-around Terrace', 'Concierge'],
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'Garden Villa',
    'Expansive 6-bedroom garden villa on a half-acre plot in Runda. Mature trees, outdoor entertainment area, and staff quarters.',
    4250000, 'For Sale', 'house', 'Hot', 6, 5, 1500,
    'Runda, Nairobi', -1.2167, 36.8000,
    array['Garden', 'Staff Quarters', 'BBQ Area', 'Borehole', '24/7 Security'],
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'Kiambu Half-Acre Plot',
    'Prime residential plot in a gated development, ready title deed, electricity and water connections at the boundary. Ideal for a family home or investment.',
    3800000, 'For Sale', 'land', 'New', 0, 0, 2023,
    'Kiambu Road, Kiambu', -1.1714, 36.8356,
    array['Title Deed Ready', 'Electricity Connection', 'Water Connection', 'Gated Community', 'Road Access'],
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80'
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000003',
    'Diani Beachfront Plot',
    'One-acre beachfront plot on the south coast with direct beach access — a rare opportunity for a private residence or boutique hospitality development.',
    12500000, 'For Sale', 'land', 'Hot', 0, 0, 4047,
    'Diani Beach, Kwale', -4.2833, 39.5833,
    array['Beach Access', 'Title Deed Ready', 'Ocean View'],
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80'
  )
on conflict (id) do nothing;
