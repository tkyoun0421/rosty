-- Add the admin pay-policy workflow with tracked tables, read RLS, and limited write RPCs.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying pay_policy_admin_rollout';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying pay_policy_admin_rollout';
  end if;

  if to_regtype('public.user_status') is null then
    raise exception 'public.user_status must exist before applying pay_policy_admin_rollout';
  end if;

  if to_regprocedure('public.is_active_admin()') is null then
    raise exception 'public.is_active_admin() must exist before applying pay_policy_admin_rollout';
  end if;
end;
$$;

create or replace function public.is_active_manager_or_admin()
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
      and role in ('manager', 'admin')
      and status = 'active'
  );
$$;

revoke all on function public.is_active_manager_or_admin() from public;
grant execute on function public.is_active_manager_or_admin() to authenticated;

create table if not exists public.pay_policies (
  id smallint primary key,
  default_hourly_rate numeric(10,2) not null,
  overtime_threshold_minutes integer not null,
  overtime_multiplier numeric(5,2) not null,
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default statement_timestamp(),
  constraint pay_policies_singleton_check check (id = 1),
  constraint pay_policies_default_hourly_rate_check check (default_hourly_rate > 0),
  constraint pay_policies_overtime_threshold_check check (overtime_threshold_minutes >= 0),
  constraint pay_policies_overtime_multiplier_check check (overtime_multiplier >= 1)
);

create table if not exists public.pay_rates (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  hourly_rate numeric(10,2) not null,
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default statement_timestamp(),
  constraint pay_rates_hourly_rate_check check (hourly_rate > 0)
);

alter table public.pay_policies enable row level security;
alter table public.pay_rates enable row level security;

drop policy if exists pay_policies_manager_admin_read on public.pay_policies;
drop policy if exists pay_policies_admin_write on public.pay_policies;
drop policy if exists pay_rates_admin_read on public.pay_rates;
drop policy if exists pay_rates_admin_write on public.pay_rates;

create policy pay_policies_manager_admin_read
on public.pay_policies
for select
to authenticated
using (public.is_active_manager_or_admin());

create policy pay_rates_admin_read
on public.pay_rates
for select
to authenticated
using (public.is_active_admin());

create or replace function public.admin_upsert_pay_policy(
  p_default_hourly_rate numeric,
  p_overtime_threshold_minutes integer,
  p_overtime_multiplier numeric
)
returns table (
  id smallint,
  default_hourly_rate numeric,
  overtime_threshold_minutes integer,
  overtime_multiplier numeric,
  updated_by uuid,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_id uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
begin
  if v_admin_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_admin() then
    raise exception 'Only active admins can manage pay policy.' using errcode = 'P0001';
  end if;

  if p_default_hourly_rate is null or p_default_hourly_rate <= 0 then
    raise exception 'Enter a valid default hourly rate.' using errcode = 'P0001';
  end if;

  if p_overtime_threshold_minutes is null or p_overtime_threshold_minutes < 0 then
    raise exception 'Enter a valid overtime threshold.' using errcode = 'P0001';
  end if;

  if p_overtime_multiplier is null or p_overtime_multiplier < 1 then
    raise exception 'Enter a valid overtime multiplier.' using errcode = 'P0001';
  end if;

  return query
  insert into public.pay_policies as pay_policies (
    id,
    default_hourly_rate,
    overtime_threshold_minutes,
    overtime_multiplier,
    updated_by,
    updated_at
  ) values (
    1,
    round(p_default_hourly_rate, 2),
    p_overtime_threshold_minutes,
    round(p_overtime_multiplier, 2),
    v_admin_id,
    v_now
  )
  on conflict (id) do update
  set default_hourly_rate = excluded.default_hourly_rate,
      overtime_threshold_minutes = excluded.overtime_threshold_minutes,
      overtime_multiplier = excluded.overtime_multiplier,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  returning pay_policies.id,
            pay_policies.default_hourly_rate,
            pay_policies.overtime_threshold_minutes,
            pay_policies.overtime_multiplier,
            pay_policies.updated_by,
            pay_policies.updated_at;
end;
$$;

create or replace function public.admin_set_pay_rate(
  p_user_id uuid,
  p_hourly_rate numeric default null
)
returns table (
  user_id uuid,
  hourly_rate numeric,
  updated_by uuid,
  updated_at timestamptz,
  cleared boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_id uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
  v_role public.user_role;
  v_status public.user_status;
begin
  if v_admin_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_admin() then
    raise exception 'Only active admins can manage pay rates.' using errcode = 'P0001';
  end if;

  if p_user_id is null then
    raise exception 'Choose a valid member.' using errcode = 'P0001';
  end if;

  select profiles.role, profiles.status
    into v_role, v_status
  from public.profiles
  where profiles.id = p_user_id
  for update;

  if not found then
    raise exception 'Member not found.' using errcode = 'P0001';
  end if;

  if v_status = 'deactivated' then
    raise exception 'Deactivated members cannot keep pay rates.' using errcode = 'P0001';
  end if;

  if p_hourly_rate is null then
    delete from public.pay_rates where pay_rates.user_id = p_user_id;

    return query
    select p_user_id,
           null::numeric,
           v_admin_id,
           v_now,
           true;

    return;
  end if;

  if p_hourly_rate <= 0 then
    raise exception 'Enter a valid member hourly rate.' using errcode = 'P0001';
  end if;

  return query
  insert into public.pay_rates as pay_rates (
    user_id,
    hourly_rate,
    updated_by,
    updated_at
  ) values (
    p_user_id,
    round(p_hourly_rate, 2),
    v_admin_id,
    v_now
  )
  on conflict (user_id) do update
  set hourly_rate = excluded.hourly_rate,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  returning pay_rates.user_id,
            pay_rates.hourly_rate,
            pay_rates.updated_by,
            pay_rates.updated_at,
            false;
end;
$$;

revoke all on function public.admin_upsert_pay_policy(numeric, integer, numeric) from public;
revoke all on function public.admin_set_pay_rate(uuid, numeric) from public;

grant execute on function public.admin_upsert_pay_policy(numeric, integer, numeric) to authenticated;
grant execute on function public.admin_set_pay_rate(uuid, numeric) to authenticated;

comment on function public.is_active_manager_or_admin()
  is 'Returns true when the authenticated user has an active manager or admin profile.';
comment on function public.admin_upsert_pay_policy(numeric, integer, numeric)
  is 'Creates or updates the singleton hall pay policy without exposing broad direct writes on pay_policies.';
comment on function public.admin_set_pay_rate(uuid, numeric)
  is 'Creates, updates, or clears a per-member pay-rate override without exposing broad direct writes on pay_rates.';
