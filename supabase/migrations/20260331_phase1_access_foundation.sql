create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'worker');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  role public.app_role not null,
  status text not null check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null,
  created_by uuid not null references public.profiles (id),
  accepted_by uuid references public.profiles (id),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists invites_pending_token_hash_idx
  on public.invites (token_hash)
  where status = 'pending';

create table if not exists public.worker_rates (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  hourly_rate_cents integer not null check (hourly_rate_cents > 0),
  updated_by uuid not null references public.profiles (id),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.invites enable row level security;
alter table public.worker_rates enable row level security;

create or replace function public.current_app_role(uid uuid)
returns public.app_role
language sql
stable
as $$
  select role
  from public.user_roles
  where user_id = uid
$$;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role public.app_role;
begin
  claims := event->'claims';
  user_role := public.current_app_role((event->>'user_id')::uuid);

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::text), true);
  end if;

  return jsonb_set(event, '{claims}', claims, true);
end;
$$;

create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (auth.uid() = id or (auth.jwt() ->> 'user_role') = 'admin');

create policy "user_roles_select_self_or_admin"
on public.user_roles
for select
using (auth.uid() = user_id or (auth.jwt() ->> 'user_role') = 'admin');

create policy "admins_manage_invites"
on public.invites
for all
using ((auth.jwt() ->> 'user_role') = 'admin')
with check ((auth.jwt() ->> 'user_role') = 'admin');

create policy "admins_manage_worker_rates"
on public.worker_rates
for all
using ((auth.jwt() ->> 'user_role') = 'admin')
with check ((auth.jwt() ->> 'user_role') = 'admin');
