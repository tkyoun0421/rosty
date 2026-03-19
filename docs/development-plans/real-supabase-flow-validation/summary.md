# Real Supabase Flow Validation Summary

## Goal

Validate the first live auth, invite onboarding, admin member, admin invitation, and admin pay-policy flows against the migrated Supabase project, then fix any repo-tracked defects blocking those locked behaviors.

## Shipped

- Added `supabase/migrations/20260320103000_validation_rpc_shadow_fix.sql` to patch output-parameter shadowing in `complete_profile_setup(...)`, `complete_employee_join(...)`, `admin_upsert_pay_policy(...)`, and `admin_set_pay_rate(...)`.
- Added `tests/supabase-validation-rpc-shadow-fix.test.ts` so the fix migration keeps the qualified reads and explicit primary-key conflict targets that prevent the live regressions.
- Applied the patch migration to the real Supabase project `pxxuhfagabdymdnclbfr`.
- Re-ran transactional live validation against the real project and confirmed these paths now pass without leaving remote test data behind:
  - Login profile bootstrap and self-read RLS
  - Employee invite status lookup and invite completion RPC
  - Admin member read and member-admin RPC actions
  - Admin invitation direct read or insert or update under RLS
  - Admin pay-policy RPCs plus pay-policy role leakage checks
- Verified the non-invite `complete_profile_setup(...)` RPC separately after the patch.
- Verified Supabase can issue Google OAuth authorize URLs for `rosty://auth/callback`, `rosty://auth/callback?invite=...`, and `http://localhost:8081/auth/callback` from the current project config.

## Verification

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
- Node OAuth authorize-url smoke against the live Supabase auth endpoint for the native and localhost callback URLs
- Manual UTF-8 readback of the new migration, regression test, archived plan artifacts, and `WORKLOG.md` after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.

Result: the repo gate passed on 2026-03-20, the patch migration is applied to the real Supabase project, and the live validation matrix passed against the remote database.

## Residual Risk

- The real project still has no persistent admin account, so the actual app-admin routes remain blocked until a seed or manual promotion task is completed.
- The browser or device Google OAuth round-trip and deep-link callback were only validated up to authorize URL issuance; the fully interactive app-shell flow was not run from this Windows CLI session.
- Android and iOS app-level QA still depends on generating native projects and having a device or emulator path.
- The fetched legacy single-hall tables remain in the real project until a later cleanup task is explicitly locked.

## Follow-up

- Lock the first-admin bootstrap or seed task so the real project has a persistent admin account for app-level QA.
- Run browser or device QA of the actual app login and admin routes once that persistent admin path exists.
- Decide whether to clean up the legacy single-hall tables after the seeded-admin and app-shell validation work is complete.
