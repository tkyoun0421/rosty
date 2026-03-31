-- Replace the UUID and email below with the first authenticated admin user.
-- This is a manual bootstrap step by design for Phase 1.

insert into public.profiles (id, email, full_name)
values ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Initial Admin')
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    updated_at = timezone('utc', now());

insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000001', 'admin')
on conflict (user_id) do update
set role = excluded.role,
    updated_at = timezone('utc', now());
