-- Add manager/admin cancellation review RPCs for the first queue slice.

do $$
begin
  if to_regclass('public.cancellation_requests') is null then
    raise exception 'public.cancellation_requests must exist before applying cancellation_review_rpc';
  end if;

  if to_regclass('public.assignments') is null then
    raise exception 'public.assignments must exist before applying cancellation_review_rpc';
  end if;

  if to_regtype('public.cancellation_request_status') is null then
    raise exception 'public.cancellation_request_status must exist before applying cancellation_review_rpc';
  end if;

  if to_regprocedure('public.is_active_manager_or_admin()') is null then
    raise exception 'public.is_active_manager_or_admin() must exist before applying cancellation_review_rpc';
  end if;
end;
$$;

create or replace function public.review_cancellation_request(
  p_request_id uuid,
  p_action text
)
returns table (
  request_id uuid,
  request_status public.cancellation_request_status,
  assignment_id uuid,
  assignment_status public.assignment_status
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_action text := lower(btrim(p_action));
  v_assignment_id uuid;
  v_request_status public.cancellation_request_status;
  v_assignment_status public.assignment_status;
  v_next_request_status public.cancellation_request_status;
  v_next_assignment_status public.assignment_status;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = 'P0001';
  end if;

  if not public.is_active_manager_or_admin() then
    raise exception 'Only active managers or admins can review cancellation requests.' using errcode = 'P0001';
  end if;

  if v_action not in ('approve', 'reject') then
    raise exception 'Cancellation review action must be approve or reject.' using errcode = 'P0001';
  end if;

  select cancellation_requests.assignment_id,
         cancellation_requests.status,
         assignments.status
    into v_assignment_id,
         v_request_status,
         v_assignment_status
  from public.cancellation_requests as cancellation_requests
  join public.assignments as assignments
    on assignments.id = cancellation_requests.assignment_id
  where cancellation_requests.id = p_request_id
  for update of cancellation_requests, assignments;

  if not found then
    raise exception 'The cancellation request was not found.' using errcode = 'P0001';
  end if;

  if v_request_status <> 'requested' then
    raise exception 'This cancellation request has already been reviewed.' using errcode = 'P0001';
  end if;

  if v_assignment_status <> 'cancel_requested' then
    raise exception 'The linked assignment is no longer waiting for cancellation review.' using errcode = 'P0001';
  end if;

  v_next_request_status :=
    case v_action
      when 'approve' then 'approved'::public.cancellation_request_status
      else 'rejected'::public.cancellation_request_status
    end;

  v_next_assignment_status :=
    case v_action
      when 'approve' then 'cancelled'::public.assignment_status
      else 'confirmed'::public.assignment_status
    end;

  update public.cancellation_requests
  set status = v_next_request_status,
      reviewed_by = v_user_id,
      reviewed_at = statement_timestamp(),
      updated_at = statement_timestamp()
  where id = p_request_id;

  update public.assignments
  set status = v_next_assignment_status,
      updated_by = v_user_id,
      updated_at = statement_timestamp()
  where id = v_assignment_id;

  return query
  select
    p_request_id,
    v_next_request_status,
    v_assignment_id,
    v_next_assignment_status;
end;
$$;

revoke all on function public.review_cancellation_request(uuid, text) from public;
grant execute on function public.review_cancellation_request(uuid, text) to authenticated;

comment on function public.review_cancellation_request(uuid, text)
  is 'Lets an active manager/admin approve or reject a pending cancellation request and synchronizes the linked assignment status.';
