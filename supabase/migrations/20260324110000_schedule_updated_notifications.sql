-- Enqueue schedule-updated notifications when an editable collecting schedule
-- changes its core visible fields.

do $$
begin
  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying schedule_updated_notifications';
  end if;

  if to_regclass('public.notifications') is null then
    raise exception 'public.notifications must exist before applying schedule_updated_notifications';
  end if;

  if to_regtype('public.notification_type') is null then
    raise exception 'public.notification_type must exist before applying schedule_updated_notifications';
  end if;
end;
$$;

alter type public.notification_type add value if not exists 'schedule_updated';

create or replace function public.notify_schedule_updated()
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
    'schedule_updated'::public.notification_type,
    'Schedule updated',
    case
      when coalesce(btrim(new.memo), '') <> '' then
        'The schedule for ' || new.event_date::text || ' · ' || btrim(new.memo) || ' was updated. Review the latest details.'
      else
        'The schedule for ' || new.event_date::text || ' was updated. Review the latest details.'
    end,
    '/schedule-detail?scheduleId=' || new.id::text,
    new.id
  from public.profiles as profiles
  where profiles.role = 'employee'
    and profiles.status = 'active';

  return new;
end;
$$;

drop trigger if exists schedules_updated_notifications_after_update on public.schedules;

create trigger schedules_updated_notifications_after_update
after update of event_date, package_count, memo on public.schedules
for each row
when (
  old.status = 'collecting'
  and new.status = 'collecting'
  and (
    old.event_date is distinct from new.event_date
    or old.package_count is distinct from new.package_count
    or old.memo is distinct from new.memo
  )
)
execute function public.notify_schedule_updated();

comment on function public.notify_schedule_updated()
  is 'Enqueues employee schedule-updated notifications whenever a collecting schedule changes core visible fields while remaining editable.';
