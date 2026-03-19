-- Employee join completion must run after the base `profiles` and `invitation_links`
-- schema objects exist. This function intentionally owns invite validation,
-- profile upsert, and invite consumption in one short transaction.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying complete_employee_join';
  end if;

  if to_regclass('public.invitation_links') is null then
    raise exception 'public.invitation_links must exist before applying complete_employee_join';
  end if;

  if to_regtype('public.profile_gender') is null then
    raise exception 'public.profile_gender must exist before applying complete_employee_join';
  end if;
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

  select role::text, status::text
    into v_profile_role, v_profile_status
  from public.profiles
  where id = v_user_id;

  if found then
    if v_profile_role <> 'employee' then
      raise exception 'Employee join is only available for employee onboarding.' using errcode = 'P0001';
    end if;

    if v_profile_status in ('active', 'suspended', 'deactivated') then
      raise exception 'Employee join is only available during profile setup.' using errcode = 'P0001';
    end if;
  end if;

  select id, consumed_by, consumed_at, disabled_at, expires_at
    into v_invitation_id,
         v_invitation_consumed_by,
         v_invitation_consumed_at,
         v_invitation_disabled_at,
         v_invitation_expires_at
  from public.invitation_links
  where token = p_invitation_token
    and target_role = 'employee'
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
    where id = v_invitation_id;
  end if;

  return query
  select v_user_id, v_now;
end;
$$;

revoke all on function public.complete_employee_join(text, text, text, public.profile_gender) from public;
grant execute on function public.complete_employee_join(text, text, text, public.profile_gender) to authenticated;

comment on function public.complete_employee_join(text, text, text, public.profile_gender)
  is 'Atomically validates an employee invite, upserts the onboarding profile, and consumes the invite row.';