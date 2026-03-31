create table if not exists public.attendance_check_ins (
  id uuid primary key default gen_random_uuid(),
  schedule_assignment_id uuid not null references public.schedule_assignments (id) on delete cascade,
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (id) on delete cascade,
  checked_in_at timestamptz not null default timezone('utc', now()),
  submitted_latitude double precision not null,
  submitted_longitude double precision not null,
  accuracy_meters double precision,
  distance_meters double precision not null,
  allowed_radius_meters double precision not null,
  within_allowed_radius boolean not null,
  is_late boolean not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint attendance_check_ins_schedule_assignment_key unique (schedule_assignment_id),
  constraint attendance_check_ins_submitted_latitude_check check (submitted_latitude >= -90 and submitted_latitude <= 90),
  constraint attendance_check_ins_submitted_longitude_check check (submitted_longitude >= -180 and submitted_longitude <= 180),
  constraint attendance_check_ins_accuracy_meters_check check (accuracy_meters is null or accuracy_meters >= 0),
  constraint attendance_check_ins_distance_meters_check check (distance_meters >= 0),
  constraint attendance_check_ins_allowed_radius_meters_check check (allowed_radius_meters > 0)
);

create index if not exists attendance_check_ins_schedule_id_idx
  on public.attendance_check_ins (schedule_id, checked_in_at desc);

create index if not exists attendance_check_ins_worker_user_id_idx
  on public.attendance_check_ins (worker_user_id, checked_in_at desc);

alter table public.attendance_check_ins enable row level security;

create policy "admins_select_attendance_check_ins"
on public.attendance_check_ins
for select
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

create policy "workers_select_own_attendance_check_ins"
on public.attendance_check_ins
for select
to authenticated
using (
  worker_user_id = (select auth.uid())
  and (auth.jwt() ->> 'user_role') = 'worker'
);

create policy "workers_insert_own_confirmed_assignment_attendance_check_ins"
on public.attendance_check_ins
for insert
to authenticated
with check (
  worker_user_id = (select auth.uid())
  and (auth.jwt() ->> 'user_role') = 'worker'
  and exists (
    select 1
    from public.schedule_assignments
    where schedule_assignments.id = attendance_check_ins.schedule_assignment_id
      and schedule_assignments.schedule_id = attendance_check_ins.schedule_id
      and schedule_assignments.worker_user_id = attendance_check_ins.worker_user_id
      and schedule_assignments.status = 'confirmed'
  )
);