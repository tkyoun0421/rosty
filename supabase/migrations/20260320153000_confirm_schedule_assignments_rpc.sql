-- Add the first limited schedule-confirm RPC for the Assignment Workspace slice.

do $$
begin
  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying confirm_schedule_assignments_rpc';
  end if;

  if to_regclass('public.assignments') is null then
    raise exception 'public.assignments must exist before applying confirm_schedule_assignments_rpc';
  end if;

  if to_regtype('public.schedule_status') is null then
    raise exception 'public.schedule_status must exist before applying confirm_schedule_assignments_rpc';
  end if;

  if to_regtype('public.assignment_status') is null then
    raise exception 'public.assignment_status must exist before applying confirm_schedule_assignments_rpc';
  end if;

  if to_regprocedure('public.is_active_manager_or_admin()') is null then
    raise exception 'public.is_active_manager_or_admin() must exist before applying confirm_schedule_assignments_rpc';
  end if;
end;
$$;

create or replace function public.confirm_schedule_assignments(
  p_schedule_id uuid
)
returns table (
  schedule_id uuid,
  schedule_status public.schedule_status,
  confirmed_assignment_count integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_schedule_status public.schedule_status;
  v_confirmed_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_manager_or_admin() then
    raise exception 'Only active managers or admins can confirm assignments.' using errcode = 'P0001';
  end if;

  select schedules.status
    into v_schedule_status
  from public.schedules as schedules
  where schedules.id = p_schedule_id
  for update;

  if not found then
    raise exception 'The schedule was not found.' using errcode = 'P0001';
  end if;

  if v_schedule_status <> 'collecting' then
    raise exception 'Only collecting schedules can be confirmed.' using errcode = 'P0001';
  end if;

  update public.assignments
  set status = 'confirmed',
      confirmed_at = statement_timestamp(),
      confirmed_by = v_user_id,
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where schedule_id = p_schedule_id
    and status = 'proposed';

  get diagnostics v_confirmed_count = row_count;

  update public.schedules
  set status = 'assigned',
      collection_state = 'locked',
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where id = p_schedule_id;

  return query
  select
    p_schedule_id,
    'assigned'::public.schedule_status,
    v_confirmed_count;
end;
$$;

revoke all on function public.confirm_schedule_assignments(uuid) from public;
grant execute on function public.confirm_schedule_assignments(uuid) to authenticated;

comment on function public.confirm_schedule_assignments(uuid)
  is 'Confirms all proposed assignments for a collecting schedule and moves the schedule into assigned/locked state.';
