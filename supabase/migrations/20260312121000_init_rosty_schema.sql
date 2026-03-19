create extension if not exists pgcrypto;
create type public.user_role as enum ('manager', 'staff');
create type public.publication_status as enum ('draft', 'published');
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null
);
create table if not exists public.halls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  manager_user_id uuid not null references public.profiles (id)
);
create table if not exists public.memberships (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  hall_id uuid not null references public.halls (id) on delete cascade,
  role public.user_role not null,
  job_title text not null,
  unique (hall_id, user_id)
);
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  hall_id uuid not null references public.halls (id) on delete cascade,
  staff_user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  role_label text not null,
  notes text,
  event_id text,
  event_name text
);
create table if not exists public.schedule_publications (
  hall_id uuid not null references public.halls (id) on delete cascade,
  week_start_date date not null,
  status public.publication_status not null default 'draft',
  version integer not null default 1,
  published_at timestamptz,
  published_by uuid references public.profiles (id),
  primary key (hall_id, week_start_date)
);
create table if not exists public.acknowledgements (
  shift_id uuid not null references public.shifts (id) on delete cascade,
  staff_user_id uuid not null references public.profiles (id) on delete cascade,
  acknowledged_at timestamptz not null default timezone('utc', now()),
  primary key (shift_id, staff_user_id)
);
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'Rosty 사용자'), '@', 1))
  )
  on conflict (id) do update
    set full_name = excluded.full_name;

  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
create or replace function public.is_hall_member(target_hall_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.memberships membership
    where membership.user_id = auth.uid()
      and membership.hall_id = target_hall_id
  );
$$;
create or replace function public.is_hall_manager(target_hall_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.memberships membership
    where membership.user_id = auth.uid()
      and membership.hall_id = target_hall_id
      and membership.role = 'manager'
  );
$$;
alter table public.profiles enable row level security;
alter table public.halls enable row level security;
alter table public.memberships enable row level security;
alter table public.shifts enable row level security;
alter table public.schedule_publications enable row level security;
alter table public.acknowledgements enable row level security;
create policy "profiles_select_self_or_hall_manager"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1
    from public.memberships membership
    where membership.user_id = public.profiles.id
      and public.is_hall_manager(membership.hall_id)
  )
);
create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
create policy "halls_select_members"
on public.halls
for select
using (public.is_hall_member(id));
create policy "memberships_select_self_or_manager"
on public.memberships
for select
using (auth.uid() = user_id or public.is_hall_manager(hall_id));
create policy "shifts_select_hall_members"
on public.shifts
for select
using (public.is_hall_member(hall_id));
create policy "shifts_insert_hall_manager"
on public.shifts
for insert
with check (public.is_hall_manager(hall_id));
create policy "shifts_update_hall_manager"
on public.shifts
for update
using (public.is_hall_manager(hall_id))
with check (public.is_hall_manager(hall_id));
create policy "shifts_delete_hall_manager"
on public.shifts
for delete
using (public.is_hall_manager(hall_id));
create policy "schedule_publications_select_hall_members"
on public.schedule_publications
for select
using (public.is_hall_member(hall_id));
create policy "schedule_publications_manage_hall_manager"
on public.schedule_publications
for all
using (public.is_hall_manager(hall_id))
with check (public.is_hall_manager(hall_id));
create policy "acknowledgements_select_self_or_manager"
on public.acknowledgements
for select
using (
  auth.uid() = staff_user_id
  or exists (
    select 1
    from public.shifts shift
    where shift.id = acknowledgements.shift_id
      and public.is_hall_manager(shift.hall_id)
  )
);
create policy "acknowledgements_insert_shift_owner"
on public.acknowledgements
for insert
with check (
  auth.uid() = staff_user_id
  and exists (
    select 1
    from public.shifts shift
    where shift.id = acknowledgements.shift_id
      and shift.staff_user_id = auth.uid()
      and public.is_hall_member(shift.hall_id)
  )
);
create policy "acknowledgements_update_shift_owner"
on public.acknowledgements
for update
using (auth.uid() = staff_user_id)
with check (auth.uid() = staff_user_id);
