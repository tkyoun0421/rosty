-- Bridge the fetched legacy single-hall baseline to the current auth and invitation base schema.
-- This keeps the remote history intact while creating the minimum objects and profile shape
-- required by the later onboarding, RLS, member-admin, and pay-policy rollout migrations.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying auth_invitation_base_schema';
  end if;

  if to_regclass('public.halls') is null then
    raise exception 'public.halls must exist before applying auth_invitation_base_schema';
  end if;

  if to_regclass('public.memberships') is null then
    raise exception 'public.memberships must exist before applying auth_invitation_base_schema';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying auth_invitation_base_schema';
  end if;
end;
$$;

do $$
begin
  create type public.user_status as enum (
    'profile_incomplete',
    'pending_approval',
    'active',
    'suspended',
    'deactivated'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.profile_gender as enum (
    'male',
    'female',
    'unspecified'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_type type_def
    join pg_namespace namespace_def on namespace_def.oid = type_def.typnamespace
    join pg_enum enum_def on enum_def.enumtypid = type_def.oid
    where namespace_def.nspname = 'public'
      and type_def.typname = 'user_role'
      and enum_def.enumlabel = 'staff'
  ) then
    create type public.user_role_next as enum ('employee', 'manager', 'admin');

    alter table public.memberships
      alter column role type public.user_role_next
      using (
        case role::text
          when 'staff' then 'employee'
          else role::text
        end
      )::public.user_role_next;

    drop type public.user_role;
    alter type public.user_role_next rename to user_role;
  end if;
end;
$$;

alter table public.profiles
  add column if not exists phone_number text not null default '',
  add column if not exists gender public.profile_gender not null default 'unspecified',
  add column if not exists role public.user_role not null default 'employee',
  add column if not exists status public.user_status not null default 'profile_incomplete',
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id),
  add column if not exists last_active_at timestamptz,
  add column if not exists created_at timestamptz not null default statement_timestamp(),
  add column if not exists updated_at timestamptz not null default statement_timestamp();

update public.profiles
set role = case
    when exists (
      select 1
      from public.halls
      where halls.manager_user_id = profiles.id
    ) then 'manager'::public.user_role
    when exists (
      select 1
      from public.memberships
      where memberships.user_id = profiles.id
        and memberships.role = 'manager'
    ) then 'manager'::public.user_role
    else 'employee'::public.user_role
  end,
  status = case
    when exists (
      select 1
      from public.halls
      where halls.manager_user_id = profiles.id
    ) then 'active'::public.user_status
    when exists (
      select 1
      from public.memberships
      where memberships.user_id = profiles.id
    ) then 'active'::public.user_status
    else 'profile_incomplete'::public.user_status
  end,
  updated_at = coalesce(profiles.updated_at, statement_timestamp())
where true;

alter table public.profiles
  alter column phone_number set default '',
  alter column gender set default 'unspecified',
  alter column role set default 'employee',
  alter column status set default 'profile_incomplete',
  alter column created_at set default statement_timestamp(),
  alter column updated_at set default statement_timestamp();

create table if not exists public.invitation_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  target_role public.user_role not null default 'employee',
  created_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  consumed_by uuid references public.profiles(id),
  consumed_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default statement_timestamp()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone_number,
    gender,
    role,
    status,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(
        coalesce(new.email, concat('rosty-user-', new.id::text)),
        '@',
        1
      )
    ),
    '',
    'unspecified',
    'employee',
    'profile_incomplete',
    statement_timestamp(),
    statement_timestamp()
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        updated_at = excluded.updated_at;

  return new;
end;
$$;

drop policy if exists "profiles_select_self_or_hall_manager" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;

drop policy if exists invitation_links_admin_read on public.invitation_links;
drop policy if exists invitation_links_admin_insert on public.invitation_links;
drop policy if exists invitation_links_admin_update on public.invitation_links;

comment on table public.invitation_links
  is 'Admin-issued employee onboarding links used by the current auth and invitation workflow.';
comment on column public.profiles.status
  is 'Current onboarding or access state for the signed-in user profile.';
comment on column public.profiles.role
  is 'Current app role used by the auth shell and admin workflows.';
