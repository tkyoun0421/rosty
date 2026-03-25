-- Add a limited bulk member-admin RPC so client bulk actions do not need to
-- issue one member mutation per network round-trip.

do $$
begin
  if to_regprocedure('public.admin_manage_member(uuid, text, public.user_role)') is null then
    raise exception 'public.admin_manage_member(uuid, text, public.user_role) must exist before applying member_admin_bulk_rpc';
  end if;

  if to_regprocedure('public.is_active_admin()') is null then
    raise exception 'public.is_active_admin() must exist before applying member_admin_bulk_rpc';
  end if;
end;
$$;

create or replace function public.admin_manage_members_bulk(
  p_member_ids uuid[],
  p_action text,
  p_next_role public.user_role default null
)
returns table (
  total_requested integer,
  total_updated integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin_id uuid := auth.uid();
  v_member_ids uuid[];
  v_member_id uuid;
  v_requested_count integer := 0;
  v_updated_count integer := 0;
begin
  if v_admin_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_admin() then
    raise exception 'Only active admins can manage members.' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(distinct member_id), '{}'::uuid[])
    into v_member_ids
  from unnest(p_member_ids) as member_id
  where member_id is not null;

  v_requested_count := coalesce(array_length(v_member_ids, 1), 0);

  if v_requested_count = 0 then
    raise exception 'Choose at least one valid member.' using errcode = 'P0001';
  end if;

  foreach v_member_id in array v_member_ids loop
    perform
    from public.admin_manage_member(
      v_member_id,
      p_action,
      p_next_role
    );

    v_updated_count := v_updated_count + 1;
  end loop;

  return query
  select
    v_requested_count,
    v_updated_count;
end;
$$;

revoke all on function public.admin_manage_members_bulk(uuid[], text, public.user_role) from public;
grant execute on function public.admin_manage_members_bulk(uuid[], text, public.user_role) to authenticated;

comment on function public.admin_manage_members_bulk(uuid[], text, public.user_role)
  is 'Applies the current admin member action set across a deduplicated member-id list inside one server transaction.';
