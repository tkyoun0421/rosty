alter table public.profiles
  add column if not exists gender text,
  add column if not exists birth_date date,
  add column if not exists avatar_url text;

alter table public.profiles
  drop constraint if exists profiles_gender_check;

alter table public.profiles
  add constraint profiles_gender_check
  check (gender is null or gender in ('male', 'female', 'other'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.bootstrap_first_admin(target_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  select role
  into assigned_role
  from public.user_roles
  where user_id = target_user_id;

  if assigned_role is not null then
    return assigned_role;
  end if;

  if not exists (select 1 from public.user_roles limit 1) then
    insert into public.user_roles (user_id, role)
    values (target_user_id, 'admin')
    on conflict (user_id) do nothing;
  end if;

  select role
  into assigned_role
  from public.user_roles
  where user_id = target_user_id;

  return assigned_role;
end;
$$;

revoke all on function public.bootstrap_first_admin(uuid) from public;
delete from public.user_roles
where user_id = '00000000-0000-0000-0000-000000000001';

delete from public.profiles
where id = '00000000-0000-0000-0000-000000000001'
  and email = 'admin@example.com';

grant execute on function public.bootstrap_first_admin(uuid) to service_role;

