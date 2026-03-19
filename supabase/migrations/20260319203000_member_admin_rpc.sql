-- Move admin member mutations behind a limited RPC instead of broad direct profile updates.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying member_admin_rpc';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying member_admin_rpc';
  end if;

  if to_regtype('public.user_status') is null then
    raise exception 'public.user_status must exist before applying member_admin_rpc';
  end if;

  if to_regprocedure('public.is_active_admin()') is null then
    raise exception 'public.is_active_admin() must exist before applying member_admin_rpc';
  end if;
end;
$$;

create or replace function public.admin_manage_member(
  p_member_id uuid,
  p_action text,
  p_next_role public.user_role default null
)
returns table (
  profile_id uuid,
  role public.user_role,
  status public.user_status,
  approved_at timestamptz,
  approved_by uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_id uuid := auth.uid();
  v_action text := lower(btrim(coalesce(p_action, '')));
  v_now timestamptz := statement_timestamp();
  v_role public.user_role;
  v_status public.user_status;
begin
  if v_admin_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_admin() then
    raise exception 'Only active admins can manage members.' using errcode = 'P0001';
  end if;

  if p_member_id is null then
    raise exception 'Choose a valid member.' using errcode = 'P0001';
  end if;

  if v_action not in ('approve', 'suspend', 'reactivate', 'change-role') then
    raise exception 'Choose a valid member admin action.' using errcode = 'P0001';
  end if;

  select profiles.role, profiles.status
    into v_role, v_status
  from public.profiles
  where profiles.id = p_member_id
  for update;

  if not found then
    raise exception 'Member not found.' using errcode = 'P0001';
  end if;

  if v_action = 'approve' then
    if v_status <> 'pending_approval' then
      raise exception 'Only pending users can be approved.' using errcode = 'P0001';
    end if;

    return query
    update public.profiles
    set status = 'active',
        approved_at = v_now,
        approved_by = v_admin_id,
        updated_at = v_now
    where profiles.id = p_member_id
    returning profiles.id,
              profiles.role,
              profiles.status,
              profiles.approved_at,
              profiles.approved_by;

    return;
  end if;

  if v_action = 'suspend' then
    if v_status not in ('pending_approval', 'active') then
      raise exception 'Only pending or active users can be suspended.' using errcode = 'P0001';
    end if;

    return query
    update public.profiles
    set status = 'suspended',
        updated_at = v_now
    where profiles.id = p_member_id
    returning profiles.id,
              profiles.role,
              profiles.status,
              profiles.approved_at,
              profiles.approved_by;

    return;
  end if;

  if v_action = 'reactivate' then
    if v_status <> 'suspended' then
      raise exception 'Only suspended users can be reactivated.' using errcode = 'P0001';
    end if;

    return query
    update public.profiles
    set status = 'active',
        updated_at = v_now
    where profiles.id = p_member_id
    returning profiles.id,
              profiles.role,
              profiles.status,
              profiles.approved_at,
              profiles.approved_by;

    return;
  end if;

  if p_next_role is null then
    raise exception 'Choose a valid role.' using errcode = 'P0001';
  end if;

  if v_role = p_next_role then
    raise exception 'Choose a different role.' using errcode = 'P0001';
  end if;

  return query
  update public.profiles
  set role = p_next_role,
      updated_at = v_now
  where profiles.id = p_member_id
  returning profiles.id,
            profiles.role,
            profiles.status,
            profiles.approved_at,
            profiles.approved_by;
end;
$$;

revoke all on function public.admin_manage_member(uuid, text, public.user_role) from public;
grant execute on function public.admin_manage_member(uuid, text, public.user_role) to authenticated;

comment on function public.admin_manage_member(uuid, text, public.user_role)
  is 'Applies the current admin member actions without requiring broad direct update access on profiles.';

drop policy if exists profiles_admin_update on public.profiles;
