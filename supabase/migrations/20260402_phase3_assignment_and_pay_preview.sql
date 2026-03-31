create type public.assignment_status as enum ('draft', 'confirmed');

create table if not exists public.schedule_assignments (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  schedule_role_slot_id uuid not null references public.schedule_role_slots (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (id) on delete cascade,
  status public.assignment_status not null default 'draft',
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint schedule_assignments_schedule_worker_key unique (schedule_id, worker_user_id),
  constraint schedule_assignments_confirmation_state_check check (
    (status = 'draft' and confirmed_at is null and confirmed_by is null)
    or (status = 'confirmed' and confirmed_at is not null and confirmed_by is not null)
  )
);

create index if not exists schedule_assignments_slot_status_idx
  on public.schedule_assignments (schedule_role_slot_id, status);

create index if not exists schedule_assignments_worker_confirmed_idx
  on public.schedule_assignments (worker_user_id, schedule_id)
  where status = 'confirmed';

alter table public.schedule_assignments enable row level security;

create policy "admins_manage_schedule_assignments"
on public.schedule_assignments
for all
using ((auth.jwt() ->> 'user_role') = 'admin')
with check ((auth.jwt() ->> 'user_role') = 'admin');

create policy "workers_select_own_confirmed_schedule_assignments"
on public.schedule_assignments
for select
to authenticated
using (
  worker_user_id = (select auth.uid())
  and status = 'confirmed'
);

create policy "workers_select_own_confirmed_schedules"
on public.schedules
for select
to authenticated
using (
  status = 'confirmed'
  and exists (
    select 1
    from public.schedule_assignments
    where schedule_assignments.schedule_id = schedules.id
      and schedule_assignments.worker_user_id = (select auth.uid())
      and schedule_assignments.status = 'confirmed'
  )
);

create policy "workers_select_own_confirmed_schedule_role_slots"
on public.schedule_role_slots
for select
to authenticated
using (
  exists (
    select 1
    from public.schedule_assignments
    where schedule_assignments.schedule_role_slot_id = schedule_role_slots.id
      and schedule_assignments.worker_user_id = (select auth.uid())
      and schedule_assignments.status = 'confirmed'
  )
);

create policy "workers_select_own_worker_rate"
on public.worker_rates
for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.confirm_schedule_assignments(
  p_schedule_id uuid,
  p_confirmed_by uuid
)
returns setof public.schedule_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_confirmed_at timestamptz := timezone('utc', now());
begin
  if not exists (
    select 1
    from public.schedules
    where id = p_schedule_id
  ) then
    raise exception 'SCHEDULE_NOT_FOUND';
  end if;

  if not exists (
    select 1
    from public.schedule_assignments
    where schedule_id = p_schedule_id
      and status = 'draft'
  ) then
    raise exception 'NO_DRAFT_ASSIGNMENTS';
  end if;

  update public.schedule_assignments
  set
    status = 'confirmed',
    confirmed_at = v_confirmed_at,
    confirmed_by = p_confirmed_by,
    updated_at = v_confirmed_at
  where schedule_id = p_schedule_id
    and status = 'draft';

  update public.schedules
  set
    status = 'confirmed',
    updated_at = v_confirmed_at
  where id = p_schedule_id;

  return query
  select *
  from public.schedule_assignments
  where schedule_id = p_schedule_id
    and status = 'confirmed'
  order by created_at, id;
end;
$$;

grant execute on function public.confirm_schedule_assignments(uuid, uuid)
  to authenticated, service_role;
