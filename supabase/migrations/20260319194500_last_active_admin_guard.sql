-- Protect the final active admin from losing active admin access.
-- This keeps direct `profiles` updates aligned with the existing client guard.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying last_active_admin_guard';
  end if;

  if to_regtype('public.user_role') is null then
    raise exception 'public.user_role must exist before applying last_active_admin_guard';
  end if;

  if to_regtype('public.user_status') is null then
    raise exception 'public.user_status must exist before applying last_active_admin_guard';
  end if;
end;
$$;

create or replace function public.enforce_last_active_admin_guard()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.role <> 'admin' or old.status <> 'active' then
    return new;
  end if;

  if new.role = 'admin' and new.status = 'active' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('public.profiles.last_active_admin_guard'));

  if not exists (
    select 1
    from public.profiles
    where id <> old.id
      and role = 'admin'
      and status = 'active'
  ) then
    raise exception 'The last active admin cannot be suspended, deactivated, or downgraded.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_last_active_admin_guard on public.profiles;

create trigger profiles_last_active_admin_guard
before update of role, status on public.profiles
for each row
execute function public.enforce_last_active_admin_guard();

comment on function public.enforce_last_active_admin_guard()
  is 'Blocks updates that would remove active admin access from the final active admin profile.';
