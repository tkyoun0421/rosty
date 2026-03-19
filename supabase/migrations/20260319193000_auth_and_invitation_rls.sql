-- First RLS rollout for current auth, members, and invitation workflows.
-- This migration assumes the base tables, enums, and the existing
-- `complete_employee_join` function are already present.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying auth_and_invitation_rls';
  end if;

  if to_regclass('public.invitation_links') is null then
    raise exception 'public.invitation_links must exist before applying auth_and_invitation_rls';
  end if;

  if to_regtype('public.profile_gender') is null then
    raise exception 'public.profile_gender must exist before applying auth_and_invitation_rls';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying auth_and_invitation_rls';
  end if;

  if to_regtype('public.user_status') is null then
    raise exception 'public.user_status must exist before applying auth_and_invitation_rls';
  end if;
end;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.complete_profile_setup(
  p_full_name text,
  p_phone_number text,
  p_gender public.profile_gender
)
returns table (
  profile_id uuid,
  role public.user_role,
  status public.user_status
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
  v_full_name text := btrim(p_full_name);
  v_phone_number text := regexp_replace(coalesce(p_phone_number, ''), '\D', '', 'g');
  v_existing_role public.user_role;
  v_existing_status public.user_status;
  v_target_role public.user_role := 'employee';
  v_target_status public.user_status := 'pending_approval';
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if length(v_full_name) < 2 or length(v_full_name) > 60 then
    raise exception 'Enter your full name.' using errcode = 'P0001';
  end if;

  if length(v_phone_number) < 9 or length(v_phone_number) > 13 then
    raise exception 'Enter a valid phone number.' using errcode = 'P0001';
  end if;

  select role, status
    into v_existing_role, v_existing_status
  from public.profiles
  where id = v_user_id
  for update;

  if found then
    if v_existing_status in ('active', 'suspended', 'deactivated') then
      raise exception 'Profile setup is only available during onboarding.' using errcode = 'P0001';
    end if;

    v_target_role := v_existing_role;
  end if;

  insert into public.profiles as profiles (
    id,
    full_name,
    phone_number,
    gender,
    role,
    status
  ) values (
    v_user_id,
    v_full_name,
    v_phone_number,
    p_gender,
    v_target_role,
    v_target_status
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      phone_number = excluded.phone_number,
      gender = excluded.gender,
      role = excluded.role,
      status = excluded.status,
      updated_at = v_now;

  return query
  select v_user_id, v_target_role, v_target_status;
end;
$$;

create or replace function public.get_employee_invitation_status(
  p_invitation_token text
)
returns table (
  id uuid,
  token text,
  target_role public.user_role,
  created_by uuid,
  expires_at timestamptz,
  consumed_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    invitation_links.id,
    invitation_links.token,
    invitation_links.target_role,
    invitation_links.created_by,
    invitation_links.expires_at,
    invitation_links.consumed_at,
    invitation_links.disabled_at,
    invitation_links.created_at
  from public.invitation_links
  where invitation_links.token = btrim(p_invitation_token)
    and invitation_links.target_role = 'employee';
$$;

revoke all on function public.is_active_admin() from public;
revoke all on function public.complete_profile_setup(text, text, public.profile_gender) from public;
revoke all on function public.get_employee_invitation_status(text) from public;

grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.complete_profile_setup(text, text, public.profile_gender) to authenticated;
grant execute on function public.get_employee_invitation_status(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.invitation_links enable row level security;

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_read on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
drop policy if exists invitation_links_admin_read on public.invitation_links;
drop policy if exists invitation_links_admin_insert on public.invitation_links;
drop policy if exists invitation_links_admin_update on public.invitation_links;

create policy profiles_self_read
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy profiles_admin_read
on public.profiles
for select
to authenticated
using (public.is_active_admin());

create policy profiles_admin_update
on public.profiles
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy invitation_links_admin_read
on public.invitation_links
for select
to authenticated
using (public.is_active_admin());

create policy invitation_links_admin_insert
on public.invitation_links
for insert
to authenticated
with check (public.is_active_admin());

create policy invitation_links_admin_update
on public.invitation_links
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

comment on function public.is_active_admin()
  is 'Returns true when the authenticated user has an active admin profile.';
comment on function public.complete_profile_setup(text, text, public.profile_gender)
  is 'Completes onboarding profile setup without requiring broad self-update access on profiles.';
comment on function public.get_employee_invitation_status(text)
  is 'Returns limited employee invitation status for login and onboarding checks without direct table access.';