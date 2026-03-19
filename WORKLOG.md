# WORKLOG

## Current Task

Pending the next locked runtime or bootstrap task after completing the real Supabase flow validation patch.

## Plan Doc

- Archive summary: `docs/development-plans/real-supabase-flow-validation/summary.md`
- Archive plan: `docs/development-plans/real-supabase-flow-validation/plan.md`

## Last Completed

Completed the real Supabase flow validation patch task:

- Added `20260320103000_validation_rpc_shadow_fix.sql` to fix output-parameter shadowing in the live auth and pay-policy RPCs.
- Applied the patch migration to the real Supabase project.
- Verified login bootstrap, profile setup, employee invite onboarding, admin member actions, admin invitation actions, and admin pay-policy actions against the real project with transactional SQL validation.
- Verified Supabase can issue Google OAuth authorize URLs for the native and localhost callback targets used by the current app flow.

## Next Action

Lock the first-admin bootstrap or seed task, then run browser or device QA of the actual app login and admin routes with a persistent admin account on the real Supabase project.

## Blockers

- The real project still has no persistent admin account, so actual admin routes in the app remain blocked until a seed or manual promotion task is completed.
- Fully interactive browser or device OAuth and deep-link QA was not run from this Windows CLI session.
- The fetched legacy single-hall tables remain in the remote project until a later cleanup task is explicitly locked.
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Latest Verification

- Added and applied `supabase/migrations/20260320103000_validation_rpc_shadow_fix.sql` on 2026-03-20.
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Pre-apply `pnpm supabase:migrations:status`
- Pre-apply `pnpm supabase:migrations:dry-run`
- `pnpm supabase:migrations:apply`
- Post-apply `pnpm supabase:migrations:status`
- Post-apply `pnpm supabase:migrations:dry-run`
- Transactional `pnpm supabase db query --linked -f <temp>\\rosty-real-validation.sql`
- Transactional `pnpm supabase db query --linked -f <temp>\\rosty-profile-setup-smoke.sql`
- Transactional `pnpm supabase db query --linked -f <temp>\\rosty-employee-join-smoke.sql`
- Node OAuth authorize-url smoke for `rosty://auth/callback`, `rosty://auth/callback?invite=...`, and `http://localhost:8081/auth/callback`
- Manual UTF-8 readback of the new migration, regression test, archived plan artifacts, and `WORKLOG.md` after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Completed the real Supabase flow validation patch task on 2026-03-20.
