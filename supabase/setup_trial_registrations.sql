-- Trial program registration table
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.trial_registrations (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  organization     text not null check (char_length(trim(organization)) >= 2),
  hospital_code    text not null check (char_length(trim(hospital_code)) >= 1),
  full_name        text not null check (char_length(trim(full_name)) >= 2),
  phone            text not null check (char_length(trim(phone)) >= 9),
  email            text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  business_type    text not null,
  business_type_other text,
  referral_source  text not null,
  referral_source_other text,
  product_interest text not null,
  product_interest_other text,
  urgency          text not null,
  notes            text
);

create unique index if not exists trial_registrations_email_idx
  on public.trial_registrations (lower(email));

alter table public.trial_registrations enable row level security;

create policy "Public can insert trial registrations"
  on public.trial_registrations
  for insert
  to anon, authenticated
  with check (true);

-- Admin read (same emails as forum admin policy — edit as needed)
drop policy if exists "Admins can read trial registrations" on public.trial_registrations;

create policy "Admins can read trial registrations"
  on public.trial_registrations
  for select
  to authenticated
  using (
    lower(auth.jwt() ->> 'email') in (
      'admin@icommittech.com',
      'info@icommittech.com'
    )
  );
