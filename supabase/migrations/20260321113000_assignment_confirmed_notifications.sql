-- Patch confirm_schedule_assignments to enqueue assignment-confirmed notifications.

do $$
begin
  if to_regclass('public.notifications') is null then
    raise exception 'public.notifications must exist before applying assignment_confirmed_notifications';
  end if;

  if to_regtype('public.notification_type') is null then
    raise exception 'public.notification_type must exist before applying assignment_confirmed_notifications';
  end if;

  if to_regprocedure('public.confirm_schedule_assignments(uuid)') is null then
    raise exception 'public.confirm_schedule_assignments(uuid) must exist before applying assignment_confirmed_notifications';
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
  v_event_date date;
  v_memo text;
  v_confirmed_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_manager_or_admin() then
    raise exception 'Only active managers or admins can confirm assignments.' using errcode = 'P0001';
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

  if v_schedule_status <> 'collecting' then
    raise exception 'Only collecting schedules can be confirmed.' using errcode = 'P0001';
  end if;

  with confirmed_assignments as (
    update public.assignments
    set status = 'confirmed',
        confirmed_at = statement_timestamp(),
        confirmed_by = v_user_id,
        updated_by = v_user_id,
        updated_at = statement_timestamp()
    where schedule_id = p_schedule_id
      and status = 'proposed'
    returning assignee_user_id
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
      confirmed_assignments.assignee_user_id,
      'assignment_confirmed'::public.notification_type,
      'Assignment confirmed',
      case
        when coalesce(btrim(v_memo), '') <> '' then
          'Your assignment for ' || v_event_date::text || ' · ' || btrim(v_memo) || ' was confirmed.'
        else
          'Your assignment for ' || v_event_date::text || ' was confirmed.'
      end,
      '/assignment-detail?scheduleId=' || p_schedule_id::text,
      p_schedule_id
    from confirmed_assignments
    where confirmed_assignments.assignee_user_id is not null
  )
  select count(*)
    into v_confirmed_count
  from confirmed_assignments;

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

comment on function public.confirm_schedule_assignments(uuid)
  is 'Confirms all proposed assignments for a collecting schedule, moves the schedule into assigned/locked state, and enqueues assignment-confirmed notifications.';
