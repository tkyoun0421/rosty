-- Add the tracked cancellation request schema and the limited employee request RPC.

do $$
begin
  if to_regclass('public.assignments') is null then
    raise exception 'public.assignments must exist before applying assignment_cancellation_request';
  end if;

  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying assignment_cancellation_request';
  end if;

  if to_regtype('public.assignment_status') is null then
    raise exception 'public.assignment_status must exist before applying assignment_cancellation_request';
  end if;
end;
$$;

do $$
begin
  create type public.cancellation_request_status as enum (
    'requested',
    'approved',
    'rejected'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  requested_by uuid not null references public.profiles(id),
  reason text not null,
  status public.cancellation_request_status not null default 'requested',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint cancellation_requests_reason_check check (char_length(btrim(reason)) >= 5)
);

create unique index if not exists cancellation_requests_active_request_unique
  on public.cancellation_requests (assignment_id)
  where status = 'requested';

alter table public.cancellation_requests enable row level security;

drop policy if exists cancellation_requests_employee_read on public.cancellation_requests;
drop policy if exists cancellation_requests_employee_insert on public.cancellation_requests;
drop policy if exists cancellation_requests_manager_admin_read on public.cancellation_requests;
drop policy if exists cancellation_requests_manager_admin_write on public.cancellation_requests;

create policy cancellation_requests_employee_read
on public.cancellation_requests
for select
to authenticated
using (requested_by = auth.uid());

create policy cancellation_requests_employee_insert
on public.cancellation_requests
for insert
to authenticated
with check (requested_by = auth.uid());

create policy cancellation_requests_manager_admin_read
on public.cancellation_requests
for select
to authenticated
using (public.is_active_manager_or_admin());

create policy cancellation_requests_manager_admin_write
on public.cancellation_requests
for update
to authenticated
using (public.is_active_manager_or_admin())
with check (public.is_active_manager_or_admin());

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

  return query
  select
    v_request_id,
    p_assignment_id,
    'cancel_requested'::public.assignment_status,
    'requested'::public.cancellation_request_status;
end;
$$;

revoke all on function public.request_assignment_cancellation(uuid, text) from public;
grant execute on function public.request_assignment_cancellation(uuid, text) to authenticated;

comment on table public.cancellation_requests
  is 'Employee cancellation requests for confirmed assignments.';
comment on function public.request_assignment_cancellation(uuid, text)
  is 'Creates a new employee cancellation request and moves the assignment into cancel_requested.';
