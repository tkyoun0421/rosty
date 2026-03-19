# WORKLOG

## Current Task

Pending the next locked implementation or rollout task after completing the admin pay policy rollout.

## Plan Doc

- Archive summary: `docs/development-plans/admin-pay-policy-rollout/summary.md`
- Archive plan: `docs/development-plans/admin-pay-policy-rollout/plan.md`

## Last Completed

Completed the admin pay policy rollout task:

- Added `supabase/migrations/20260319214500_pay_policy_admin_rollout.sql`.
- Added the tracked `pay_policies` and `pay_rates` tables with read-side RLS plus `is_active_manager_or_admin()`, `admin_upsert_pay_policy(...)`, and `admin_set_pay_rate(...)`.
- Added the `Pay Policy` admin route, pay-policy feature slice, and admin shell entry points from `Manager Home` and `Members`.
- Added focused Jest coverage for pay-policy validation and the new RPC wrappers.
- Updated the product and schema docs and archived the completed feature plan into `docs/development-plans/admin-pay-policy-rollout/` with `plan.md` and `summary.md`.

## Next Action

Apply the pending auth, member-admin, and pay-policy migrations to the real Supabase project, then validate the admin pay-policy flow end to end. If rollout credentials remain unavailable, lock the next unblocked payroll-facing implementation task before changing code.

## Blockers

- The tracked Supabase migrations still have not been applied to the real project.
- GitHub or local rollout secrets remain required for the first real migration apply.
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Latest Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `git diff --check`
- Manual UTF-8 readback of the new migration, pay-policy feature files, route changes, and updated docs after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Added the admin pay policy rollout on 2026-03-19.
