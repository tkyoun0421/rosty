-- Patch admin_manage_member so approvals enqueue user-approved notifications.

do $$
begin
  if to_regclass('public.notifications') is null then
    raise exception 'public.notifications must exist before applying user_approved_notifications';
  end if;

  if to_regtype('public.notification_type') is null then
    raise exception 'public.notification_type must exist before applying user_approved_notifications';
  end if;

  if to_regprocedure('public.admin_manage_member(uuid, text, public.user_role)') is null then
    raise exception 'public.admin_manage_member(uuid, text, public.user_role) must exist before applying user_approved_notifications';
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
    with updated_member as (
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
                profiles.approved_by
    ), inserted_notification as (
      insert into public.notifications (
        user_id,
        type,
        title,
        body,
        target_route,
        target_id
      )
      select
        updated_member.id,
        'user_approved'::public.notification_type,
        'Access approved',
        'Your access was approved. You can now enter Rosty.',
        case
          when updated_member.role = 'employee' then '/employee-home'
          else '/manager-home'
        end,
        updated_member.id
      from updated_member
    )
    select
      updated_member.id,
      updated_member.role,
      updated_member.status,
      updated_member.approved_at,
      updated_member.approved_by
    from updated_member;

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

comment on function public.admin_manage_member(uuid, text, public.user_role)
  is 'Applies the current admin member actions without requiring broad direct update access on profiles and enqueues user-approved notifications on approval.';
