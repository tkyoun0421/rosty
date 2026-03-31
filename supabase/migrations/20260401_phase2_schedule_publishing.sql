create type public.schedule_status as enum ('recruiting', 'assigning', 'confirmed');

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.schedule_status not null default 'recruiting',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint schedules_time_range_check check (ends_at > starts_at)
);

create table if not exists public.schedule_role_slots (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  role_code text not null,
  headcount integer not null check (headcount > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint schedule_role_slots_schedule_role_code_key unique (schedule_id, role_code)
);

create table if not exists public.schedule_applications (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  worker_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint schedule_applications_schedule_worker_key unique (schedule_id, worker_user_id)
);

create index if not exists schedules_recruiting_starts_at_idx
  on public.schedules (starts_at)
  where status = 'recruiting';

create index if not exists schedule_role_slots_schedule_id_idx
  on public.schedule_role_slots (schedule_id);

create index if not exists schedule_applications_worker_user_id_idx
  on public.schedule_applications (worker_user_id, schedule_id);

create or replace function public.create_schedule_with_slots(
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_created_by uuid,
  p_slots jsonb
)
returns public.schedules
language plpgsql
security definer
set search_path = public
as $$
declare
  v_schedule public.schedules;
  v_slot jsonb;
  v_role_code text;
  v_headcount integer;
begin
  if jsonb_typeof(p_slots) <> 'array' or jsonb_array_length(p_slots) = 0 then
    raise exception 'Schedule slots must be a non-empty array.';
  end if;

  insert into public.schedules (starts_at, ends_at, created_by)
  values (p_starts_at, p_ends_at, p_created_by)
  returning * into v_schedule;

  for v_slot in
    select value
    from jsonb_array_elements(p_slots)
  loop
    v_role_code := nullif(trim(v_slot->>'roleCode'), '');
    v_headcount := (v_slot->>'headcount')::integer;

    if v_role_code is null then
      raise exception 'Schedule slot roleCode is required.';
    end if;

    if v_headcount is null or v_headcount <= 0 then
      raise exception 'Schedule slot headcount must be positive.';
    end if;

    insert into public.schedule_role_slots (schedule_id, role_code, headcount)
    values (v_schedule.id, v_role_code, v_headcount);
  end loop;

  return v_schedule;
end;
$$;

grant execute on function public.create_schedule_with_slots(timestamptz, timestamptz, uuid, jsonb)
  to authenticated, service_role;

alter table public.schedules enable row level security;
alter table public.schedule_role_slots enable row level security;
alter table public.schedule_applications enable row level security;

create policy "admins_manage_schedules"
on public.schedules
for all
using ((auth.jwt() ->> 'user_role') = 'admin')
with check ((auth.jwt() ->> 'user_role') = 'admin');

create policy "workers_view_recruiting_schedules"
on public.schedules
for select
to authenticated
using (status = 'recruiting' or (auth.jwt() ->> 'user_role') = 'admin');

create policy "admins_manage_schedule_role_slots"
on public.schedule_role_slots
for all
using ((auth.jwt() ->> 'user_role') = 'admin')
with check ((auth.jwt() ->> 'user_role') = 'admin');

create policy "workers_view_recruiting_schedule_role_slots"
on public.schedule_role_slots
for select
to authenticated
using (
  exists (
    select 1
    from public.schedules
    where schedules.id = schedule_role_slots.schedule_id
      and (schedules.status = 'recruiting' or (auth.jwt() ->> 'user_role') = 'admin')
  )
);

create policy "admins_manage_schedule_applications"
on public.schedule_applications
for all
using ((auth.jwt() ->> 'user_role') = 'admin')
with check ((auth.jwt() ->> 'user_role') = 'admin');

create policy "workers_select_own_schedule_applications"
on public.schedule_applications
for select
to authenticated
using (
  worker_user_id = auth.uid()
  or (auth.jwt() ->> 'user_role') = 'admin'
);

create policy "workers_insert_own_recruiting_schedule_applications"
on public.schedule_applications
for insert
to authenticated
with check (
  worker_user_id = auth.uid()
  and (auth.jwt() ->> 'user_role') = 'worker'
  and exists (
    select 1
    from public.schedules
    where schedules.id = schedule_applications.schedule_id
      and schedules.status = 'recruiting'
  )
);
