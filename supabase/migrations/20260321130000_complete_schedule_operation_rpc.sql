-- Add the first limited schedule completion RPC for assigned schedules with recorded actual time.

do $$
begin
  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying complete_schedule_operation_rpc';
  end if;

  if to_regclass('public.assignments') is null then
    raise exception 'public.assignments must exist before applying complete_schedule_operation_rpc';
  end if;

  if to_regclass('public.schedule_time_records') is null then
    raise exception 'public.schedule_time_records must exist before applying complete_schedule_operation_rpc';
  end if;

  if to_regclass('public.cancellation_requests') is null then
    raise exception 'public.cancellation_requests must exist before applying complete_schedule_operation_rpc';
  end if;

  if to_regtype('public.schedule_status') is null then
    raise exception 'public.schedule_status must exist before applying complete_schedule_operation_rpc';
  end if;

  if to_regtype('public.assignment_status') is null then
    raise exception 'public.assignment_status must exist before applying complete_schedule_operation_rpc';
  end if;

  if to_regprocedure('public.is_active_manager_or_admin()') is null then
    raise exception 'public.is_active_manager_or_admin() must exist before applying complete_schedule_operation_rpc';
  end if;
end;
$$;

create or replace function public.complete_schedule_operation(
  p_schedule_id uuid
)
returns table (
  schedule_id uuid,
  schedule_status public.schedule_status,
  completed_assignment_count integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_schedule_status public.schedule_status;
  v_actual_start_at timestamptz;
  v_actual_end_at timestamptz;
  v_completed_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_manager_or_admin() then
    raise exception 'Only active managers or admins can complete schedules.' using errcode = 'P0001';
  end if;

  select schedules.status
    into v_schedule_status
  from public.schedules as schedules
  where schedules.id = p_schedule_id
  for update;

  if not found then
    raise exception 'The schedule was not found.' using errcode = 'P0001';
  end if;

  if v_schedule_status <> 'assigned' then
    raise exception 'Only assigned schedules can be completed.' using errcode = 'P0001';
  end if;

  select schedule_time_records.actual_start_at,
         schedule_time_records.actual_end_at
    into v_actual_start_at,
         v_actual_end_at
  from public.schedule_time_records as schedule_time_records
  where schedule_time_records.schedule_id = p_schedule_id
  for update;

  if v_actual_start_at is null or v_actual_end_at is null then
    raise exception 'Record actual start and end times before completing the schedule.' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.cancellation_requests as cancellation_requests
    join public.assignments as assignments
      on assignments.id = cancellation_requests.assignment_id
    where assignments.schedule_id = p_schedule_id
      and cancellation_requests.status = 'requested'
  ) then
    raise exception 'Resolve pending cancellation requests before completing the schedule.' using errcode = 'P0001';
  end if;

  update public.assignments
  set status = 'completed',
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where schedule_id = p_schedule_id
    and status = 'confirmed';

  get diagnostics v_completed_count = row_count;

  update public.schedules
  set status = 'completed',
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where id = p_schedule_id;

  return query
  select
    p_schedule_id,
    'completed'::public.schedule_status,
    v_completed_count;
end;
$$;

revoke all on function public.complete_schedule_operation(uuid) from public;
grant execute on function public.complete_schedule_operation(uuid) to authenticated;

comment on function public.complete_schedule_operation(uuid)
  is 'Lets an active manager/admin complete an assigned schedule after actual time is recorded and pending cancellation requests are resolved.';
