# First Admin Bootstrap Summary

## Goal

Add a repo-tracked bootstrap path that can promote one existing Supabase auth user into the first persistent Rosty admin account without relying on ad hoc dashboard SQL.

## Shipped

- Added `scripts/run-supabase-first-admin.cjs`.
- Added `pnpm supabase:first-admin` so the repo now has a dedicated first-admin bootstrap command.
- The new command accepts `--email <address>` or `--user-id <uuid>` and reuses the existing Supabase rollout prerequisites and link flow.
- The bootstrap SQL is repo-tracked and guarded so it:
  - requires an existing `auth.users` row
  - serializes execution with an advisory lock
  - refuses to promote a different user once an active admin already exists
  - upserts the target profile into `role = admin` and `status = active`
- Added `tests/supabase-first-admin-bootstrap.test.ts` for forwarded arg parsing, ambiguous-target rejection, and SQL generation coverage.
- Updated the README, setup guide, Supabase schema notes, and `WORKLOG.md` to document the new bootstrap path.
- Kept Jest on `watchman: false` in `jest.config.cjs` so the repo test baseline remains runnable in the current local environment.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- `corepack pnpm supabase:first-admin`

Result: the repo gate passed on 2026-03-20, and the new bootstrap command fails safely before any remote mutation when no target user is supplied.

## Residual Risk

- The actual remote bootstrap was not executed because this session still does not have the intended first-admin user email or UUID.
- Browser or device OAuth round-trip QA and actual app-admin route QA still remain after the persistent admin is created.
- The fetched legacy single-hall tables remain in the remote project until a later cleanup task is explicitly locked.
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Follow-up

- Provide the real target auth user email or UUID and run `corepack pnpm supabase:first-admin -- --email <email>` or `--user-id <uuid>`.
- Run browser or device QA for login, callback routing, and the actual admin app routes once that persistent admin account exists.
- Decide later whether to clean up the legacy single-hall tables after the seeded-admin and app-shell validation work is complete.
