-- Digital Hospital Forum 2026 — Registration table
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.forum_registrations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  event_name      text not null default 'Digital Hospital Forum 2026',
  full_name       text not null check (char_length(trim(full_name)) >= 2),
  email           text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  phone           text not null check (char_length(trim(phone)) >= 9),
  organization    text not null check (char_length(trim(organization)) >= 2),
  position        text,
  attendance_days text not null check (attendance_days in ('both', 'day1', 'day2')),
  bring_notebook  boolean not null default true,
  notes           text
);

create unique index if not exists forum_registrations_email_event_idx
  on public.forum_registrations (lower(email), event_name);

alter table public.forum_registrations enable row level security;

-- Public can submit registration only (no read/update/delete)
create policy "Public can insert forum registrations"
  on public.forum_registrations
  for insert
  to anon, authenticated
  with check (true);

-- Optional: allow authenticated admins to read (create admin users in Supabase Auth)
-- create policy "Admins can read registrations"
--   on public.forum_registrations
--   for select
--   to authenticated
--   using (auth.jwt() ->> 'role' = 'service_role'); -- adjust per your auth setup
