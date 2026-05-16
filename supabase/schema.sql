-- Asteria Space V1 backend schema
-- Run this only inside the Supabase project: Asteria inbox chat.
-- V1 scope: system login, basic profile, private inbox, screenshot upload, staff reply, email notification events.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create table if not exists public.user_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  auth_email text not null unique,
  role text not null default 'customer' check (role in ('customer', 'staff')),
  label text not null default 'Asteria Space user',
  contact_email text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Asteria Space user',
  self_name text,
  phone_number text,
  whatsapp text,
  ig_handle text,
  telegram_handle text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('customer', 'admin')),
  body text not null default '',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.account_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('create_account', 'reset_password', 'delete_account', 'update_role')),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid references public.message_threads(id) on delete cascade,
  type text not null default 'staff_reply',
  payload jsonb not null default '{}',
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_accounts_username on public.user_accounts (username);
create index if not exists idx_user_accounts_auth_email on public.user_accounts (auth_email);
create index if not exists idx_user_accounts_role on public.user_accounts (role);
create index if not exists idx_profiles_contact_email on public.profiles (contact_email);
create index if not exists idx_message_threads_customer_id on public.message_threads (customer_id);
create index if not exists idx_chat_messages_customer_id on public.chat_messages (customer_id);
create index if not exists idx_chat_messages_thread_id_created_at on public.chat_messages (thread_id, created_at);
create index if not exists idx_notification_events_delivered_at on public.notification_events (delivered_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_user_accounts_updated_at on public.user_accounts;
create trigger touch_user_accounts_updated_at
before update on public.user_accounts
for each row execute function public.touch_updated_at();

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.touch_thread_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.message_threads
  set last_message_at = new.created_at,
      updated_at = new.created_at
  where public.message_threads.id = new.thread_id;

  if new.sender_role = 'admin' then
    insert into public.notification_events (customer_id, thread_id, type, payload)
    values (
      new.customer_id,
      new.thread_id,
      'staff_reply',
      jsonb_build_object('message_id', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_chat_message_insert on public.chat_messages;
create trigger on_chat_message_insert
after insert on public.chat_messages
for each row execute function public.touch_thread_on_message();

alter table public.admin_users enable row level security;
alter table public.user_accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.message_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.account_audit_events enable row level security;
alter table public.notification_events enable row level security;

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "Members can read own account" on public.user_accounts;
create policy "Members can read own account"
on public.user_accounts for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Admins can manage accounts" on public.user_accounts;
create policy "Admins can manage accounts"
on public.user_accounts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Members can read own profile" on public.profiles;
create policy "Members can read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Members can insert own profile" on public.profiles;
create policy "Members can insert own profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Members can update own profile" on public.profiles;
create policy "Members can update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Members can read own thread" on public.message_threads;
create policy "Members can read own thread"
on public.message_threads for select
to authenticated
using (customer_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Members can create own thread" on public.message_threads;
create policy "Members can create own thread"
on public.message_threads for insert
to authenticated
with check (customer_id = (select auth.uid()));

drop policy if exists "Members and admins can update thread" on public.message_threads;
create policy "Members and admins can update thread"
on public.message_threads for update
to authenticated
using (customer_id = (select auth.uid()) or public.is_admin())
with check (customer_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Members and admins can read chat" on public.chat_messages;
create policy "Members and admins can read chat"
on public.chat_messages for select
to authenticated
using (customer_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Members can send own chat messages" on public.chat_messages;
create policy "Members can send own chat messages"
on public.chat_messages for insert
to authenticated
with check (
  (
    customer_id = (select auth.uid())
    and sender_id = (select auth.uid())
    and sender_role = 'customer'
    and exists (
      select 1
      from public.message_threads
      where public.message_threads.id = chat_messages.thread_id
        and public.message_threads.customer_id = (select auth.uid())
    )
  )
  or
  (
    public.is_admin()
    and sender_id = (select auth.uid())
    and sender_role = 'admin'
    and exists (
      select 1
      from public.message_threads
      where public.message_threads.id = chat_messages.thread_id
        and public.message_threads.customer_id = chat_messages.customer_id
    )
  )
);

drop policy if exists "Admins can read account audit events" on public.account_audit_events;
create policy "Admins can read account audit events"
on public.account_audit_events for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can create account audit events" on public.account_audit_events;
create policy "Admins can create account audit events"
on public.account_audit_events for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can read notification events" on public.notification_events;
create policy "Admins can read notification events"
on public.notification_events for select
to authenticated
using (public.is_admin());

drop policy if exists "System and admins can create notification events" on public.notification_events;
create policy "System and admins can create notification events"
on public.notification_events for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update notification delivery" on public.notification_events;
create policy "Admins can update notification delivery"
on public.notification_events for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Storage bucket for screenshots:
-- Create a private bucket named: space-uploads
drop policy if exists "Space members can upload own files" on storage.objects;
create policy "Space members can upload own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'space-uploads'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Space members can read own files" on storage.objects;
create policy "Space members can read own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'space-uploads'
  and ((select auth.uid())::text = (storage.foldername(name))[1] or public.is_admin())
);

drop policy if exists "Space admins can manage upload files" on storage.objects;
create policy "Space admins can manage upload files"
on storage.objects for all
to authenticated
using (bucket_id = 'space-uploads' and public.is_admin())
with check (bucket_id = 'space-uploads' and public.is_admin());
