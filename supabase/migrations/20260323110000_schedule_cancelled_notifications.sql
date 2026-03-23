-- Enqueue schedule-cancelled notifications for affected employees when an
-- operator cancels a collecting or assigned schedule.

do $$
begin
  if to_regclass('public.notifications') is null then
    raise exception 'public.notifications must exist before applying schedule_cancelled_notifications';
  end if;

  if to_regtype('public.notification_type') is null then
    raise exception 'public.notification_type must exist before applying schedule_cancelled_notifications';
  end if;

  if to_regprocedure('public.cancel_schedule_operation(uuid)') is null then
    raise exception 'public.cancel_schedule_operation(uuid) must exist before applying schedule_cancelled_notifications';
  end if;
end;
$$;

alter type public.notification_type add value if not exists 'schedule_cancelled';

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
  v_event_date date;
  v_memo text;
  v_cancelled_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_manager_or_admin() then
    raise exception 'Only active managers or admins can cancel schedules.' using errcode = 'P0001';
  end if;

  select schedules.status,
         schedules.event_date,
         schedules.memo
    into v_schedule_status,
         v_event_date,
         v_memo
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

  with targeted_assignments as (
    select assignments.id,
           assignments.assignee_user_id,
           assignments.status as previous_status
    from public.assignments as assignments
    where assignments.schedule_id = p_schedule_id
      and assignments.status in ('proposed', 'confirmed')
  ), cancelled_assignments as (
    update public.assignments as assignments
    set status = 'cancelled',
        updated_by = v_user_id,
        updated_at = statement_timestamp()
    from targeted_assignments
    where assignments.id = targeted_assignments.id
    returning targeted_assignments.assignee_user_id,
              targeted_assignments.previous_status
  ), inserted_notifications as (
    insert into public.notifications (
      user_id,
      type,
      title,
      body,
      target_route,
      target_id
    )
    select distinct
      cancelled_assignments.assignee_user_id,
      'schedule_cancelled'::public.notification_type,
      'Schedule cancelled',
      case
        when coalesce(btrim(v_memo), '') <> '' then
          'The schedule for ' || v_event_date::text || ' · ' || btrim(v_memo) || ' was cancelled. Your assignment was removed.'
        else
          'The schedule for ' || v_event_date::text || ' was cancelled. Your assignment was removed.'
      end,
      '/schedule-detail?scheduleId=' || p_schedule_id::text,
      p_schedule_id
    from cancelled_assignments
    where cancelled_assignments.previous_status = 'confirmed'
      and cancelled_assignments.assignee_user_id is not null
  )
  select count(*)
    into v_cancelled_count
  from cancelled_assignments;

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

comment on function public.cancel_schedule_operation(uuid)
  is 'Lets an active manager/admin cancel a collecting or assigned schedule after pending cancellation requests are resolved and enqueues schedule-cancelled notifications for affected confirmed assignees.';
