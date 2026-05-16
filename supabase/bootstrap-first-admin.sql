-- Use this only after you manually create the first staff user in Supabase Auth.
-- Replace the values below before running.

insert into public.user_accounts (
  user_id,
  username,
  auth_email,
  role,
  label,
  contact_email
)
values (
  'd4a962c6-da54-46ac-ae0b-5b4993bab069',
  'staff',
  'staff@accounts.asteria-space.local',
  'staff',
  '第一個客服',
  'staff@asteria.space'
)
on conflict (user_id) do update
set
  username = excluded.username,
  auth_email = excluded.auth_email,
  role = excluded.role,
  label = excluded.label,
  contact_email = excluded.contact_email;

insert into public.admin_users (user_id)
values ('d4a962c6-da54-46ac-ae0b-5b4993bab069')
on conflict (user_id) do nothing;
