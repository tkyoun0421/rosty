-- Add a limited self-deactivation RPC for the Settings slice.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying deactivate_my_account_rpc';
  end if;

  if to_regclass('public.assignments') is null then
    raise exception 'public.assignments must exist before applying deactivate_my_account_rpc';
  end if;

  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying deactivate_my_account_rpc';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying deactivate_my_account_rpc';
  end if;

  if to_regtype('public.user_status') is null then
    raise exception 'public.user_status must exist before applying deactivate_my_account_rpc';
  end if;
end;
$$;

create or replace function public.deactivate_my_account()
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
  v_current_status public.user_status;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  select profiles.status
  into v_current_status
  from public.profiles as profiles
  where profiles.id = v_user_id
  for update;

  if v_current_status is null then
    raise exception 'The current profile could not be found.' using errcode = 'P0001';
  end if;

  if v_current_status <> 'active' then
    raise exception 'Only active users can deactivate their account.' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.assignments as assignments
    inner join public.schedules as schedules
      on schedules.id = assignments.schedule_id
    where assignments.assignee_user_id = v_user_id
      and assignments.status = 'confirmed'
      and schedules.event_date >= current_date
  ) then
    raise exception 'Resolve your upcoming confirmed assignments before deactivating this account.'
      using errcode = 'P0001';
  end if;

  update public.profiles as profiles
  set status = 'deactivated',
      updated_at = v_now
  where profiles.id = v_user_id
  returning
    profiles.id,
    profiles.role,
    profiles.status
  into profile_id, role, status;

  if profile_id is null then
    raise exception 'The account could not be deactivated.' using errcode = 'P0001';
  end if;

  return next;
end;
$$;

revoke all on function public.deactivate_my_account() from public;
grant execute on function public.deactivate_my_account() to authenticated;

comment on function public.deactivate_my_account()
  is 'Lets an active user deactivate their own account after all upcoming confirmed assignments are resolved.';
