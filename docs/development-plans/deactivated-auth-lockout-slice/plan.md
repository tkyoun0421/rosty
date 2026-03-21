# Deactivated Auth Lockout Slice

## Summary

Make `deactivated` a first-class auth status so blocked accounts cannot re-enter the app shell through stale restored sessions.

## Scope

- Extend auth types and session parsing to recognize `deactivated`.
- Normalize restored deactivated sessions back to the login shell with a clear blocked message.
- Keep the existing `Suspended` screen behavior unchanged.
- Refresh worklog and archive references.

Out of scope:

- A dedicated deactivated screen
- Admin-driven reactivation flows
- New auth providers
- Push or email messaging for deactivation

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the deactivated auth lockout slice.
2. Extend auth parsing/routing for the `deactivated` status.
3. Normalize restored deactivated sessions back to login with a blocked error message.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated auth model types and tests under `src/features/auth/model/`
- Updated auth store session normalization logic under `src/features/auth/model/auth-store.ts`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `deactivated` is accepted as a valid auth status from the profile row.
- Restored deactivated sessions no longer open protected routes.
- The login shell can render the blocked state without route loops.

Known gaps:

- The product still does not expose a dedicated deactivated guidance screen.

## Done Criteria

- Deactivated sessions are locked out consistently after restore.
- Auth parsing, routing, and store state all agree on the `deactivated` status.
- The slice is committed and pushed after verification.
