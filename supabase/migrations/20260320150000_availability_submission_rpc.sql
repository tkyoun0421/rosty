-- Add the tracked availability submission schema and limited employee submission RPC.

do $$
begin
  if to_regclass('public.schedules') is null then
    raise exception 'public.schedules must exist before applying availability_submission_rpc';
  end if;

  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying availability_submission_rpc';
  end if;

  if to_regtype('public.availability_collection_state') is null then
    raise exception 'public.availability_collection_state must exist before applying availability_submission_rpc';
  end if;

  if to_regtype('public.schedule_status') is null then
    raise exception 'public.schedule_status must exist before applying availability_submission_rpc';
  end if;
end;
$$;

do $$
begin
  create type public.availability_status as enum ('available', 'unavailable');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.availability_submissions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.availability_status not null,
  submitted_at timestamptz,
  updated_at timestamptz not null default statement_timestamp(),
  unique (schedule_id, user_id)
);

alter table public.availability_submissions enable row level security;

drop policy if exists availability_submissions_employee_read on public.availability_submissions;
drop policy if exists availability_submissions_employee_write on public.availability_submissions;
drop policy if exists availability_submissions_manager_admin_read on public.availability_submissions;

create policy availability_submissions_employee_read
on public.availability_submissions
for select
to authenticated
using (user_id = auth.uid());

create policy availability_submissions_employee_write
on public.availability_submissions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy availability_submissions_manager_admin_read
on public.availability_submissions
for select
to authenticated
using (public.is_active_manager_or_admin());

create or replace function public.submit_my_availability_response(
  p_schedule_id uuid,
  p_status public.availability_status
)
returns table (
  submission_id uuid,
  schedule_id uuid,
  user_id uuid,
  status public.availability_status,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
  v_schedule_status public.schedule_status;
  v_collection_state public.availability_collection_state;
  v_user_role public.user_role;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  select profiles.role
    into v_user_role
  from public.profiles as profiles
  where profiles.id = v_user_id;

  if v_user_role is distinct from 'employee'::public.user_role then
    raise exception 'Only active employees can submit availability.' using errcode = 'P0001';
  end if;

  select schedules.status, schedules.collection_state
    into v_schedule_status, v_collection_state
  from public.schedules as schedules
  where schedules.id = p_schedule_id
  for update;

  if not found then
    raise exception 'The schedule was not found.' using errcode = 'P0001';
  end if;

  if v_schedule_status = 'cancelled' then
    raise exception 'Cancelled schedules cannot receive availability responses.' using errcode = 'P0001';
  end if;

  if v_collection_state <> 'open' then
    raise exception 'Availability responses are only open while the schedule collection is open.' using errcode = 'P0001';
  end if;

  insert into public.availability_submissions as availability_submissions (
    schedule_id,
    user_id,
    status,
    submitted_at,
    updated_at
  ) values (
    p_schedule_id,
    v_user_id,
    p_status,
    v_now,
    v_now
  )
  on conflict (schedule_id, user_id) do update
  set status = excluded.status,
      submitted_at = excluded.submitted_at,
      updated_at = excluded.updated_at
  returning availability_submissions.id,
            availability_submissions.schedule_id,
            availability_submissions.user_id,
            availability_submissions.status,
            availability_submissions.submitted_at
  into submission_id, schedule_id, user_id, status, submitted_at;

  return next;
end;
$$;

revoke all on function public.submit_my_availability_response(uuid, public.availability_status) from public;
grant execute on function public.submit_my_availability_response(uuid, public.availability_status) to authenticated;

comment on table public.availability_submissions
  is 'Employee availability responses per schedule.';
comment on function public.submit_my_availability_response(uuid, public.availability_status)
  is 'Lets an active employee create or update their own availability response while the schedule collection is open.';
