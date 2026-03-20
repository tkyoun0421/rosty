-- Add the first in-app notifications schema and patch the current cancellation RPCs
-- to enqueue notification rows.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying notifications_inbox_rollout';
  end if;

  if to_regclass('public.assignments') is null then
    raise exception 'public.assignments must exist before applying notifications_inbox_rollout';
  end if;

  if to_regclass('public.cancellation_requests') is null then
    raise exception 'public.cancellation_requests must exist before applying notifications_inbox_rollout';
  end if;

  if to_regprocedure('public.request_assignment_cancellation(uuid, text)') is null then
    raise exception 'public.request_assignment_cancellation(uuid, text) must exist before applying notifications_inbox_rollout';
  end if;

  if to_regprocedure('public.review_cancellation_request(uuid, text)') is null then
    raise exception 'public.review_cancellation_request(uuid, text) must exist before applying notifications_inbox_rollout';
  end if;
end;
$$;

do $$
begin
  create type public.notification_type as enum (
    'user_approved',
    'schedule_created',
    'assignment_confirmed',
    'cancellation_requested',
    'cancellation_approved',
    'cancellation_rejected'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  target_route text not null,
  target_id uuid,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default statement_timestamp()
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_self_read on public.notifications;
drop policy if exists notifications_self_update on public.notifications;

create policy notifications_self_read
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy notifications_self_update
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.request_assignment_cancellation(
  p_assignment_id uuid,
  p_reason text
)
returns table (
  request_id uuid,
  assignment_id uuid,
  assignment_status public.assignment_status,
  request_status public.cancellation_request_status
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_reason text := btrim(p_reason);
  v_schedule_id uuid;
  v_assignee_user_id uuid;
  v_assignment_status public.assignment_status;
  v_event_date date;
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if char_length(v_reason) < 5 then
    raise exception 'Enter a cancellation reason.' using errcode = 'P0001';
  end if;

  select assignments.schedule_id,
         assignments.assignee_user_id,
         assignments.status,
         schedules.event_date
    into v_schedule_id,
         v_assignee_user_id,
         v_assignment_status,
         v_event_date
  from public.assignments as assignments
  join public.schedules as schedules
    on schedules.id = assignments.schedule_id
  where assignments.id = p_assignment_id
  for update of assignments;

  if not found then
    raise exception 'The assignment was not found.' using errcode = 'P0001';
  end if;

  if v_assignee_user_id is distinct from v_user_id then
    raise exception 'You can only request cancellation for your own assignment.' using errcode = 'P0001';
  end if;

  if v_assignment_status <> 'confirmed' then
    raise exception 'Only confirmed assignments can be cancelled.' using errcode = 'P0001';
  end if;

  if v_event_date < current_date then
    raise exception 'Cancellation requests are only available before the event date.' using errcode = 'P0001';
  end if;

  insert into public.cancellation_requests (
    assignment_id,
    requested_by,
    reason,
    status
  ) values (
    p_assignment_id,
    v_user_id,
    v_reason,
    'requested'
  )
  returning id into v_request_id;

  update public.assignments
  set status = 'cancel_requested',
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where id = p_assignment_id;

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
    'cancellation_requested'::public.notification_type,
    'Cancellation request waiting',
    'An employee cancellation request is waiting in the queue.',
    '/cancellation-queue',
    p_assignment_id
  from public.profiles as profiles
  where profiles.status = 'active'
    and profiles.role in ('manager', 'admin');

  return query
  select
    v_request_id,
    p_assignment_id,
    'cancel_requested'::public.assignment_status,
    'requested'::public.cancellation_request_status;
end;
$$;

create or replace function public.review_cancellation_request(
  p_request_id uuid,
  p_action text
)
returns table (
  request_id uuid,
  request_status public.cancellation_request_status,
  assignment_id uuid,
  assignment_status public.assignment_status
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_action text := lower(btrim(p_action));
  v_assignment_id uuid;
  v_requested_by uuid;
  v_schedule_id uuid;
  v_request_status public.cancellation_request_status;
  v_assignment_status public.assignment_status;
  v_next_request_status public.cancellation_request_status;
  v_next_assignment_status public.assignment_status;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_manager_or_admin() then
    raise exception 'Only active managers or admins can review cancellation requests.' using errcode = 'P0001';
  end if;

  if v_action not in ('approve', 'reject') then
    raise exception 'Cancellation review action must be approve or reject.' using errcode = 'P0001';
  end if;

  select cancellation_requests.assignment_id,
         cancellation_requests.requested_by,
         cancellation_requests.status,
         assignments.status,
         assignments.schedule_id
    into v_assignment_id,
         v_requested_by,
         v_request_status,
         v_assignment_status,
         v_schedule_id
  from public.cancellation_requests as cancellation_requests
  join public.assignments as assignments
    on assignments.id = cancellation_requests.assignment_id
  where cancellation_requests.id = p_request_id
  for update of cancellation_requests, assignments;

  if not found then
    raise exception 'The cancellation request was not found.' using errcode = 'P0001';
  end if;

  if v_request_status <> 'requested' then
    raise exception 'This cancellation request has already been reviewed.' using errcode = 'P0001';
  end if;

  if v_assignment_status <> 'cancel_requested' then
    raise exception 'The linked assignment is no longer waiting for cancellation review.' using errcode = 'P0001';
  end if;

  v_next_request_status :=
    case v_action
      when 'approve' then 'approved'::public.cancellation_request_status
      else 'rejected'::public.cancellation_request_status
    end;

  v_next_assignment_status :=
    case v_action
      when 'approve' then 'cancelled'::public.assignment_status
      else 'confirmed'::public.assignment_status
    end;

  update public.cancellation_requests
  set status = v_next_request_status,
      reviewed_by = v_user_id,
      reviewed_at = statement_timestamp(),
      updated_at = statement_timestamp()
  where id = p_request_id;

  update public.assignments
  set status = v_next_assignment_status,
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where id = v_assignment_id;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    target_route,
    target_id
  )
  values (
    v_requested_by,
    case v_action
      when 'approve' then 'cancellation_approved'::public.notification_type
      else 'cancellation_rejected'::public.notification_type
    end,
    case v_action
      when 'approve' then 'Cancellation approved'
      else 'Cancellation rejected'
    end,
    case v_action
      when 'approve' then 'Your cancellation request was approved.'
      else 'Your cancellation request was rejected and the assignment returned to confirmed.'
    end,
    format('/assignment-detail?scheduleId=%s', v_schedule_id::text),
    v_assignment_id
  );

  return query
  select
    p_request_id,
    v_next_request_status,
    v_assignment_id,
    v_next_assignment_status;
end;
$$;

revoke all on function public.request_assignment_cancellation(uuid, text) from public;
revoke all on function public.review_cancellation_request(uuid, text) from public;
grant execute on function public.request_assignment_cancellation(uuid, text) to authenticated;
grant execute on function public.review_cancellation_request(uuid, text) to authenticated;

comment on table public.notifications
  is 'In-app notifications for the current Rosty product flows.';
comment on function public.request_assignment_cancellation(uuid, text)
  is 'Creates a new employee cancellation request, moves the assignment into cancel_requested, and enqueues manager/admin notifications.';
comment on function public.review_cancellation_request(uuid, text)
  is 'Lets an active manager/admin approve or reject a pending cancellation request, synchronizes the linked assignment status, and enqueues requester notifications.';
