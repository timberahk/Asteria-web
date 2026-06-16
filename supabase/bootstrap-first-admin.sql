-- Use this only after you manually create or confirm the first staff user in Supabase Auth.
-- Default staff login:
--   username: staff
--   auth email: timberahk@gmail.com
--
-- If you want another staff email or username, edit the values inside staff_seed first.

do $$
declare
  staff_user_id uuid;
begin
  select id
  into staff_user_id
  from auth.users
  where lower(email) = lower('timberahk@gmail.com')
  order by created_at asc
  limit 1;

  if staff_user_id is null then
    raise exception 'No Supabase Auth user found for %. Create this user in Authentication > Users first.', 'timberahk@gmail.com';
  end if;

  insert into public.user_accounts (
    user_id,
    username,
    auth_email,
    role,
    label,
    contact_email
  )
  values (
    staff_user_id,
    'staff',
    'timberahk@gmail.com',
    'staff',
    '第一個客服',
    'timberahk@gmail.com'
  )
  on conflict (user_id) do update
  set
    username = excluded.username,
    auth_email = excluded.auth_email,
    role = excluded.role,
    label = excluded.label,
    contact_email = excluded.contact_email;

  insert into public.admin_users (user_id)
  values (staff_user_id)
  on conflict (user_id) do nothing;
end $$;
