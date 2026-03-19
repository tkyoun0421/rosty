# Admin Pay Policy Rollout

## Summary

Add the first admin `Pay Policy` vertical slice so active admins can open a dedicated route, manage the hall default hourly policy, and set or clear per-member hourly-rate overrides from the app shell.

## Scope

- Add the Supabase migration for `pay_policies` and `pay_rates`, their read policies, and limited admin RPCs for pay-policy writes.
- Add the admin-only `Pay Policy` route and screen entry points from `Members` and `Manager Home`.
- Add the pay-policy query and mutation layer plus focused validation and RPC wrapper tests.
- Update the product docs, schema notes, and `WORKLOG.md` to reflect the new admin workflow.

Out of scope:

- Real Supabase apply or live environment validation in this turn
- `Team Payroll` calculations, aggregates, or manager payroll screens
- Bulk rate editing, import/export, or audit-log UI
- Broader payroll or scheduling schema rollout beyond the pay-policy tables

## Implementation Steps

1. Lock this plan and update `WORKLOG.md` before implementation starts.
2. Add a migration that creates the pay-policy tables, enables RLS read paths, and exposes limited admin RPCs for writes.
3. Add the pay-policy feature model, query/mutation wrappers, admin route, and screen wiring from the current admin shell.
4. Add focused Jest coverage, update the product/schema docs, archive the plan, refresh `WORKLOG.md`, and finish with verification plus commit/push.

## Data / Interface Impact

- New Supabase migration under `supabase/migrations/`
- New admin route and auth-route guard coverage for `Pay Policy`
- New pay-policy feature files under `src/features/payroll/`
- Updated `Members` and `Manager Home` admin navigation affordances
- Updated PRD, screen IA, state table, and Supabase schema notes

## Test Plan

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

Expected pass criteria:

- Active admins can open the `Pay Policy` route from the existing admin shell.
- Hall policy writes and per-member pay-rate writes use limited RPCs instead of broad client table updates.
- The pay-policy query and validation logic are covered by focused unit tests.
- Product and schema docs match the shipped pay-policy workflow.

Known gaps:

- The new migration still needs to be applied to the real Supabase project before the workflow is live there.
- Device QA for the new screen has not run in this turn.
- `Team Payroll` still depends on later payroll-calculation work.

## Done Criteria

- The repo contains a complete admin pay-policy vertical slice from migration to screen.
- Route access is admin-only and linked from the current admin entry points.
- Verification is green and the task ends with archived plan artifacts, `WORKLOG.md` updates, commit, and push.
