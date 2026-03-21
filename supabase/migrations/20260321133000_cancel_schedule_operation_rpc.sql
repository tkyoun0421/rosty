-- Add the first limited schedule-cancellation RPC for collecting or assigned schedules.

do $$
begin
  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying cancel_schedule_operation_rpc';
  end if;

  if to_regclass('public.assignments') is null then
    raise exception 'public.assignments must exist before applying cancel_schedule_operation_rpc';
  end if;

  if to_regclass('public.cancellation_requests') is null then
    raise exception 'public.cancellation_requests must exist before applying cancel_schedule_operation_rpc';
  end if;

  if to_regtype('public.schedule_status') is null then
    raise exception 'public.schedule_status must exist before applying cancel_schedule_operation_rpc';
  end if;

  if to_regtype('public.assignment_status') is null then
    raise exception 'public.assignment_status must exist before applying cancel_schedule_operation_rpc';
  end if;

  if to_regprocedure('public.is_active_manager_or_admin()') is null then
    raise exception 'public.is_active_manager_or_admin() must exist before applying cancel_schedule_operation_rpc';
  end if;
end;
$$;

create or replace function public.cancel_schedule_operation(
  p_schedule_id uuid
)
returns table (
  schedule_id uuid,
  schedule_status public.schedule_status,
  cancelled_assignment_count integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_schedule_status public.schedule_status;
  v_cancelled_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_manager_or_admin() then
    raise exception 'Only active managers or admins can cancel schedules.' using errcode = 'P0001';
  end if;

  select schedules.status
    into v_schedule_status
  from public.schedules as schedules
  where schedules.id = p_schedule_id
  for update;

  if not found then
    raise exception 'The schedule was not found.' using errcode = 'P0001';
  end if;

  if v_schedule_status not in ('collecting', 'assigned') then
    raise exception 'Only collecting or assigned schedules can be cancelled.' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.cancellation_requests as cancellation_requests
    join public.assignments as assignments
      on assignments.id = cancellation_requests.assignment_id
    where assignments.schedule_id = p_schedule_id
      and cancellation_requests.status = 'requested'
  ) then
    raise exception 'Resolve pending cancellation requests before cancelling the schedule.' using errcode = 'P0001';
  end if;

  update public.assignments
  set status = 'cancelled',
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where schedule_id = p_schedule_id
    and status in ('proposed', 'confirmed');

  get diagnostics v_cancelled_count = row_count;

  update public.schedules
  set status = 'cancelled',
      collection_state = 'locked',
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where id = p_schedule_id;

  return query
  select
    p_schedule_id,
    'cancelled'::public.schedule_status,
    v_cancelled_count;
end;
$$;

revoke all on function public.cancel_schedule_operation(uuid) from public;
grant execute on function public.cancel_schedule_operation(uuid) to authenticated;

comment on function public.cancel_schedule_operation(uuid)
  is 'Lets an active manager/admin cancel a collecting or assigned schedule after pending cancellation requests are resolved.';
