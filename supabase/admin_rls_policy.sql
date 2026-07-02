-- Admin read access for forum_registrations
-- Run AFTER setup_forum_registrations.sql
-- 1. Create admin user: Supabase Dashboard → Authentication → Users → Add user
-- 2. Add admin email(s) below in the policy

drop policy if exists "Admins can read registrations" on public.forum_registrations;

create policy "Admins can read registrations"
  on public.forum_registrations
  for select
  to authenticated
  using (
    lower(auth.jwt() ->> 'email') in (
      'admin@icommittech.com',
      'info@icommittech.com'
      -- เพิ่มอีเมล admin อื่นๆ ที่นี่ (ตัวพิมพ์เล็ก)
    )
  );
