# Admin Pay Policy Rollout Summary

## Goal

Add the first admin `Pay Policy` vertical slice so active admins can open a dedicated route, manage the hall default hourly policy, and set or clear per-member hourly-rate overrides from the app shell.

## Shipped

- Added `supabase/migrations/20260319214500_pay_policy_admin_rollout.sql`.
- Added `public.is_active_manager_or_admin()`, `public.admin_upsert_pay_policy(...)`, and `public.admin_set_pay_rate(...)` with the tracked `pay_policies` and `pay_rates` tables plus read-side RLS.
- Added `app/pay-policy.tsx` and the new `src/features/payroll/` feature slice for pay-policy query, mutation, validation, and UI.
- Connected `Pay Policy` entry points from `Manager Home` and `Members`, and extended auth-route access rules for the new admin-only route.
- Added focused Jest coverage for pay-policy validation and RPC wrappers.
- Updated PRD, screen IA, state tables, and Supabase schema notes to match the shipped admin pay-policy workflow.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `git diff --check`
- Manual UTF-8 readback of the new migration, pay-policy feature files, updated route files, and updated docs after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.

Result: all passed on 2026-03-19.

## Residual Risk

- The new migration still needs to be applied to the real Supabase project before the admin pay-policy flow is live there.
- `Pay Policy` has not been device-QA'd in this turn.
- Manager pay-policy read access exists at the schema level for later payroll work, but the manager-facing payroll UI is still unimplemented.

## Follow-up

- Apply `20260319193000_auth_and_invitation_rls.sql`, `20260319194500_last_active_admin_guard.sql`, `20260319203000_member_admin_rpc.sql`, and `20260319214500_pay_policy_admin_rollout.sql` to the target Supabase project in sequence.
- Validate admin hall-policy save, member-rate override save, and override clear flows against the real Supabase project.
- Lock the next payroll-facing implementation task after the migration rollout path is available or explicitly deferred.
