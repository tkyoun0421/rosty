-- Add the tracked scheduling tables needed for the Team Payroll read path.
-- This rollout keeps the scope to the current read-side schema and policies.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying payroll_read_schema_rollout';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying payroll_read_schema_rollout';
  end if;

  if to_regtype('public.user_status') is null then
    raise exception 'public.user_status must exist before applying payroll_read_schema_rollout';
  end if;

  if to_regprocedure('public.is_active_admin()') is null then
    raise exception 'public.is_active_admin() must exist before applying payroll_read_schema_rollout';
  end if;

  if to_regprocedure('public.is_active_manager_or_admin()') is null then
    raise exception 'public.is_active_manager_or_admin() must exist before applying payroll_read_schema_rollout';
  end if;
end;
$$;

do $$
begin
  create type public.required_gender as enum ('any', 'male', 'female');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.schedule_status as enum (
    'collecting',
    'assigned',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.availability_collection_state as enum ('open', 'locked');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.assignment_status as enum (
    'proposed',
    'confirmed',
    'cancel_requested',
    'cancelled',
    'completed'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.schedule_time_status as enum (
    'planned',
    'actual_recorded',
    'corrected'
  );
exception
  when duplicate_object then null;
end;
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
  );
$$;

revoke all on function public.is_active_user() from public;
grant execute on function public.is_active_user() to authenticated;

create table if not exists public.slot_presets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  position_name text not null,
  default_headcount integer not null,
  required_gender public.required_gender not null default 'any',
  is_required boolean not null default true,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint slot_presets_default_headcount_check check (default_headcount > 0),
  constraint slot_presets_sort_order_check check (sort_order >= 0)
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  package_count integer not null,
  status public.schedule_status not null default 'collecting',
  collection_state public.availability_collection_state not null default 'open',
  memo text,
  created_by uuid not null references public.profiles(id),
  updated_by uuid not null references public.profiles(id),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint schedules_package_count_check check (package_count > 0)
);

create table if not exists public.schedule_slots (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  preset_id uuid references public.slot_presets(id),
  position_name text not null,
  headcount integer not null,
  required_gender public.required_gender not null default 'any',
  is_required boolean not null default true,
  is_enabled boolean not null default true,
  sort_order integer not null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint schedule_slots_headcount_check check (headcount > 0),
  constraint schedule_slots_sort_order_check check (sort_order >= 0)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  slot_id uuid not null references public.schedule_slots(id) on delete cascade,
  assignee_user_id uuid references public.profiles(id),
  guest_name text,
  status public.assignment_status not null default 'proposed',
  is_exception_case boolean not null default false,
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default statement_timestamp(),
  constraint assignments_assignee_or_guest_check check (
    ((assignee_user_id is not null)::integer + (guest_name is not null)::integer) = 1
  )
);

create unique index if not exists assignments_schedule_assignee_unique
  on public.assignments (schedule_id, assignee_user_id)
  where assignee_user_id is not null and is_exception_case = false;

create table if not exists public.schedule_time_records (
  schedule_id uuid primary key references public.schedules(id) on delete cascade,
  planned_start_at timestamptz,
  planned_end_at timestamptz,
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  status public.schedule_time_status not null default 'planned',
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default statement_timestamp()
);

alter table public.slot_presets enable row level security;
alter table public.schedules enable row level security;
alter table public.schedule_slots enable row level security;
alter table public.assignments enable row level security;
alter table public.schedule_time_records enable row level security;

drop policy if exists slot_presets_active_read on public.slot_presets;
drop policy if exists slot_presets_admin_write on public.slot_presets;
drop policy if exists schedules_active_read on public.schedules;
drop policy if exists schedules_manager_admin_write on public.schedules;
drop policy if exists schedule_slots_active_read on public.schedule_slots;
drop policy if exists schedule_slots_manager_admin_write on public.schedule_slots;
drop policy if exists assignments_employee_read on public.assignments;
drop policy if exists assignments_manager_admin_read on public.assignments;
drop policy if exists assignments_manager_admin_write on public.assignments;
drop policy if exists schedule_time_records_active_read on public.schedule_time_records;
drop policy if exists schedule_time_records_manager_admin_write on public.schedule_time_records;

create policy slot_presets_active_read
on public.slot_presets
for select
to authenticated
using (public.is_active_user());

create policy slot_presets_admin_write
on public.slot_presets
for all
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy schedules_active_read
on public.schedules
for select
to authenticated
using (public.is_active_user());

create policy schedules_manager_admin_write
on public.schedules
for all
to authenticated
using (public.is_active_manager_or_admin())
with check (public.is_active_manager_or_admin());

create policy schedule_slots_active_read
on public.schedule_slots
for select
to authenticated
using (public.is_active_user());

create policy schedule_slots_manager_admin_write
on public.schedule_slots
for all
to authenticated
using (public.is_active_manager_or_admin())
with check (public.is_active_manager_or_admin());

create policy assignments_employee_read
on public.assignments
for select
to authenticated
using (
  public.is_active_user()
  and assignee_user_id = auth.uid()
  and status in ('confirmed', 'cancel_requested', 'cancelled', 'completed')
);

create policy assignments_manager_admin_read
on public.assignments
for select
to authenticated
using (public.is_active_manager_or_admin());

create policy assignments_manager_admin_write
on public.assignments
for all
to authenticated
using (public.is_active_manager_or_admin())
with check (public.is_active_manager_or_admin());

create policy schedule_time_records_active_read
on public.schedule_time_records
for select
to authenticated
using (public.is_active_user());

create policy schedule_time_records_manager_admin_write
on public.schedule_time_records
for all
to authenticated
using (public.is_active_manager_or_admin())
with check (public.is_active_manager_or_admin());

comment on function public.is_active_user()
  is 'Returns true when the authenticated user has an active profile.';
comment on table public.slot_presets
  is 'Reusable slot presets for the tracked Rosty scheduling schema.';
comment on table public.schedules
  is 'Tracked Rosty event schedules used by the Team Payroll read path and future scheduling flows.';
comment on table public.schedule_slots
  is 'Actual schedule slot rows created per event schedule.';
comment on table public.assignments
  is 'Tracked schedule assignments used by payroll reads and future staffing flows.';
comment on table public.schedule_time_records
  is 'Tracked schedule-level planned and actual work-time rows used by payroll estimates.';
