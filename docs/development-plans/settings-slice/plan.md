# Settings Slice

## Summary

Add the first active-user `Settings` workflow so signed-in users can review their core profile fields, update them through a limited RPC path, and sign out from a dedicated route.

## Scope

- Add a protected `Settings` route for all active users.
- Add a limited self profile-update RPC for `full_name`, `phone_number`, and `gender`.
- Reuse the existing auth/profile patterns for query and mutation.
- Add entry points from employee and manager/admin home screens.

Out of scope:

- Account deactivation
- Push permission management
- Security/session history UI
- Admin member edits from the settings screen

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the settings slice.
2. Add the limited self-update RPC and implement the settings query/mutation path.
3. Implement the protected route and settings UI plus home entry points.
4. Add focused tests, rerun verification, then commit/push the slice.

## Data / Interface Impact

- New route under `src/app/`
- New settings files under `src/features/settings/`
- New migration under `supabase/migrations/`
- Updated auth-route access, home navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active users can open the settings route.
- Profile updates go through the limited RPC path and refresh current auth/profile state.
- The repo verification baseline still passes.

Known gaps:

- Live settings writes still depend on applying the new migration to the real Supabase project.

## Done Criteria

- The app contains the first active-user settings route.
- Self profile updates use a limited RPC path.
- The slice is committed and pushed after verification.
