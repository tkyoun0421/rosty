-- Enqueue schedule-created notifications when managers or admins create a new schedule.

do $$
begin
  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying schedule_created_notifications';
  end if;

  if to_regclass('public.notifications') is null then
    raise exception 'public.notifications must exist before applying schedule_created_notifications';
  end if;

  if to_regtype('public.notification_type') is null then
    raise exception 'public.notification_type must exist before applying schedule_created_notifications';
  end if;
end;
$$;

create or replace function public.notify_schedule_created()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    target_route,
    target_id
  )
  select
    profiles.id,
    'schedule_created'::public.notification_type,
    'Schedule created',
    case
      when coalesce(btrim(new.memo), '') <> '' then
        'A new schedule for ' || new.event_date::text || ' · ' || btrim(new.memo) || ' was created.'
      else
        'A new schedule for ' || new.event_date::text || ' was created.'
    end,
    '/schedule-detail?scheduleId=' || new.id::text,
    new.id
  from public.profiles as profiles
  where profiles.role = 'employee'
    and profiles.status = 'active';

  return new;
end;
$$;

drop trigger if exists schedules_created_notifications_after_insert on public.schedules;

create trigger schedules_created_notifications_after_insert
after insert on public.schedules
for each row
execute function public.notify_schedule_created();

comment on function public.notify_schedule_created()
  is 'Enqueues employee schedule-created notifications whenever a manager or admin creates a new schedule.';
