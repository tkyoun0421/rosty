-- Add a minimal manager/admin member-directory search RPC for Global Search.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying member_directory_search_rpc';
  end if;

  if to_regprocedure('public.is_active_manager_or_admin()') is null then
    raise exception 'public.is_active_manager_or_admin() must exist before applying member_directory_search_rpc';
  end if;
end;
$$;

create or replace function public.search_member_directory(
  p_query text default null
)
returns table (
  id uuid,
  full_name text,
  phone_number text,
  gender public.profile_gender,
  role public.user_role,
  status public.user_status
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    profiles.id,
    profiles.full_name,
    profiles.phone_number,
    profiles.gender,
    profiles.role,
    profiles.status
  from public.profiles as profiles
  where public.is_active_manager_or_admin()
    and profiles.status = 'active'
    and (
      p_query is null
      or btrim(p_query) = ''
      or profiles.full_name ilike concat('%', btrim(p_query), '%')
      or profiles.phone_number ilike concat('%', regexp_replace(btrim(p_query), '\D', '', 'g'), '%')
    )
  order by profiles.full_name asc
  limit 20;
$$;

revoke all on function public.search_member_directory(text) from public;
grant execute on function public.search_member_directory(text) to authenticated;

comment on function public.search_member_directory(text)
  is 'Returns the active member directory for active managers/admins with an optional query filter.';
