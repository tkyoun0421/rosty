-- Add a limited self profile-update RPC for the first Settings slice.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles must exist before applying update_my_profile_rpc';
  end if;

  if to_regtype('public.profile_gender') is null then
    raise exception 'public.profile_gender must exist before applying update_my_profile_rpc';
  end if;
end;
$$;

create or replace function public.update_my_profile(
  p_full_name text,
  p_phone_number text,
  p_gender public.profile_gender
)
returns table (
  profile_id uuid,
  full_name text,
  phone_number text,
  gender public.profile_gender,
  role public.user_role,
  status public.user_status
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := statement_timestamp();
  v_full_name text := btrim(p_full_name);
  v_phone_number text := regexp_replace(coalesce(p_phone_number, ''), '\D', '', 'g');
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if length(v_full_name) < 2 or length(v_full_name) > 60 then
    raise exception 'Enter your full name.' using errcode = 'P0001';
  end if;

  if length(v_phone_number) < 9 or length(v_phone_number) > 13 then
    raise exception 'Enter a valid phone number.' using errcode = 'P0001';
  end if;

  update public.profiles as profiles
  set full_name = v_full_name,
      phone_number = v_phone_number,
      gender = p_gender,
      updated_at = v_now
  where profiles.id = v_user_id
  returning
    profiles.id,
    profiles.full_name,
    profiles.phone_number,
    profiles.gender,
    profiles.role,
    profiles.status
  into profile_id, full_name, phone_number, gender, role, status;

  if profile_id is null then
    raise exception 'The profile could not be updated.' using errcode = 'P0001';
  end if;

  return next;
end;
$$;

revoke all on function public.update_my_profile(text, text, public.profile_gender) from public;
grant execute on function public.update_my_profile(text, text, public.profile_gender) to authenticated;

comment on function public.update_my_profile(text, text, public.profile_gender)
  is 'Lets an authenticated user update the limited Settings profile fields without broad direct profile updates.';
