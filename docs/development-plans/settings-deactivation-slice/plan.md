# Settings Deactivation Slice

## Summary

Add the account deactivation path to `Settings` so active users can deactivate themselves, but only after all upcoming confirmed assignments are resolved.

## Scope

- Add a limited self-deactivation RPC for authenticated users.
- Block self deactivation when upcoming confirmed assignments still exist.
- Add the deactivation mutation and confirmation UI to the shared settings route.
- Sign the user out immediately after a successful deactivation.

Out of scope:

- Push token registration
- Session/device history
- A dedicated deactivated-state screen
- Manager/admin initiated account deactivation flows

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the deactivation slice.
2. Add `deactivate_my_account` with the upcoming confirmed-assignment guard.
3. Add the client API/mutation and integrate the deactivation flow into `Settings`.
4. Add focused RPC/API tests, rerun verification, then commit/push the slice.

## Data / Interface Impact

- New migration under `supabase/migrations/`
- New settings API files under `src/features/settings/api/`
- Expanded `Settings` danger-action UI under `src/features/settings/ui/`
- Updated product docs and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active users can review the deactivation action in `Settings`.
- Self deactivation goes through a limited RPC path.
- Users with upcoming confirmed assignments are blocked by the server rule.
- Successful deactivation signs the user out immediately.

Known gaps:

- Live deactivation still depends on applying the new migration to the real Supabase project.

## Done Criteria

- The app contains the first self-deactivation path in `Settings`.
- The upcoming confirmed-assignment rule is enforced server-side.
- The slice is committed and pushed after verification.
