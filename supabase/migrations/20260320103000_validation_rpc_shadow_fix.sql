-- Fix output-parameter shadowing in the live validation RPC functions.
-- The original rollout left several RETURNS TABLE functions with unqualified
-- column references that fail once executed against the real database.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying validation_rpc_shadow_fix';
  end if;

  if to_regclass('public.invitation_links') is null then
    raise exception 'public.invitation_links must exist before applying validation_rpc_shadow_fix';
  end if;

  if to_regclass('public.pay_policies') is null then
    raise exception 'public.pay_policies must exist before applying validation_rpc_shadow_fix';
  end if;

  if to_regclass('public.pay_rates') is null then
    raise exception 'public.pay_rates must exist before applying validation_rpc_shadow_fix';
  end if;

  if to_regtype('public.profile_gender') is null then
    raise exception 'public.profile_gender must exist before applying validation_rpc_shadow_fix';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying validation_rpc_shadow_fix';
  end if;

  if to_regtype('public.user_status') is null then
    raise exception 'public.user_status must exist before applying validation_rpc_shadow_fix';
  end if;
end;
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

  select profiles.role, profiles.status
    into v_existing_role, v_existing_status
  from public.profiles
  where profiles.id = v_user_id
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

create or replace function public.complete_employee_join(
  p_invitation_token text,
  p_full_name text,
  p_phone_number text,
  p_gender public.profile_gender
)
returns table (
  profile_id uuid,
  consumed_at timestamptz
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
  v_profile_role text;
  v_profile_status text;
  v_invitation_id uuid;
  v_invitation_consumed_by uuid;
  v_invitation_consumed_at timestamptz;
  v_invitation_disabled_at timestamptz;
  v_invitation_expires_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if coalesce(length(btrim(p_invitation_token)), 0) = 0 then
    raise exception 'This invitation link is no longer valid.' using errcode = 'P0001';
  end if;

  if length(v_full_name) < 2 or length(v_full_name) > 60 then
    raise exception 'Enter your full name.' using errcode = 'P0001';
  end if;

  if length(v_phone_number) < 9 or length(v_phone_number) > 13 then
    raise exception 'Enter a valid phone number.' using errcode = 'P0001';
  end if;

  select profiles.role::text, profiles.status::text
    into v_profile_role, v_profile_status
  from public.profiles
  where profiles.id = v_user_id;

  if found then
    if v_profile_role <> 'employee' then
      raise exception 'Employee join is only available for employee onboarding.' using errcode = 'P0001';
    end if;

    if v_profile_status in ('active', 'suspended', 'deactivated') then
      raise exception 'Employee join is only available during profile setup.' using errcode = 'P0001';
    end if;
  end if;

  select invitation_links.id,
         invitation_links.consumed_by,
         invitation_links.consumed_at,
         invitation_links.disabled_at,
         invitation_links.expires_at
    into v_invitation_id,
         v_invitation_consumed_by,
         v_invitation_consumed_at,
         v_invitation_disabled_at,
         v_invitation_expires_at
  from public.invitation_links
  where invitation_links.token = p_invitation_token
    and invitation_links.target_role = 'employee'
  for update;

  if not found then
    raise exception 'This invitation link is no longer valid.' using errcode = 'P0001';
  end if;

  if v_invitation_disabled_at is not null or v_invitation_expires_at <= v_now then
    raise exception 'This invitation link is no longer valid.' using errcode = 'P0001';
  end if;

  if v_profile_status = 'pending_approval'
     and (v_invitation_consumed_at is null or v_invitation_consumed_by is distinct from v_user_id) then
    raise exception 'Employee join has already been completed for this account.' using errcode = 'P0001';
  end if;

  if v_invitation_consumed_at is not null
     and v_invitation_consumed_by is distinct from v_user_id then
    raise exception 'This invitation link is no longer valid.' using errcode = 'P0001';
  end if;

  if v_invitation_consumed_at is not null and v_invitation_consumed_by = v_user_id then
    v_now := v_invitation_consumed_at;
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
    'employee',
    'pending_approval'
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      phone_number = excluded.phone_number,
      gender = excluded.gender,
      role = excluded.role,
      status = excluded.status,
      updated_at = v_now;

  if v_invitation_consumed_at is null then
    update public.invitation_links
    set consumed_by = v_user_id,
        consumed_at = v_now
    where invitation_links.id = v_invitation_id;
  end if;

  return query
  select v_user_id, v_now;
end;
$$;

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
  v_policy_id smallint;
  v_policy_default_hourly_rate numeric;
  v_policy_overtime_threshold integer;
  v_policy_overtime_multiplier numeric;
  v_policy_updated_by uuid;
  v_policy_updated_at timestamptz;
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
  on conflict on constraint pay_policies_pkey do update
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
            pay_policies.updated_at
    into v_policy_id,
         v_policy_default_hourly_rate,
         v_policy_overtime_threshold,
         v_policy_overtime_multiplier,
         v_policy_updated_by,
         v_policy_updated_at;

  return query
  select v_policy_id,
         v_policy_default_hourly_rate,
         v_policy_overtime_threshold,
         v_policy_overtime_multiplier,
         v_policy_updated_by,
         v_policy_updated_at;
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
  v_result_user_id uuid;
  v_result_hourly_rate numeric;
  v_result_updated_by uuid;
  v_result_updated_at timestamptz;
  v_result_cleared boolean;
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
  on conflict on constraint pay_rates_pkey do update
  set hourly_rate = excluded.hourly_rate,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  returning pay_rates.user_id,
            pay_rates.hourly_rate,
            pay_rates.updated_by,
            pay_rates.updated_at,
            false
    into v_result_user_id,
         v_result_hourly_rate,
         v_result_updated_by,
         v_result_updated_at,
         v_result_cleared;

  return query
  select v_result_user_id,
         v_result_hourly_rate,
         v_result_updated_by,
         v_result_updated_at,
         v_result_cleared;
end;
$$;
