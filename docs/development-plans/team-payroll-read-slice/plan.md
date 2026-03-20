# Team Payroll Read Slice

## Summary

Add the first manager or admin `Team Payroll` workflow as a read-only vertical slice. Because the tracked Supabase migrations do not yet carry the full assignment and work-time tables, this task ships the payroll calculation model and a server-shaped query boundary with deterministic seed data first.

## Scope

- Add a protected `Team Payroll` route for active manager and admin users.
- Implement the payroll calculation model for default-rate fallback, member overrides, overtime, duplicate schedule dedupe, and missing actual-time handling.
- Expose a query-backed snapshot with deterministic server-shaped seed data so the screen can ship before the tracked scheduling schema lands.
- Add entry points from the current manager home and pay-policy flows.

Out of scope:

- Real Supabase-backed payroll reads from missing `assignments` and `schedule_time_records` tables
- `My Payroll`
- Export, settlement, tax, or payslip features
- Work-time editing or scheduling schema rollout

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the `Team Payroll` read slice.
2. Implement the payroll calculation model and seeded query boundary using server-shaped inputs.
3. Add the `Team Payroll` route and UI plus manager or admin navigation entry points.
4. Add focused regression coverage, update product/docs, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New route under `src/app/`
- New payroll read files under `src/features/payroll/`
- Updated auth-route access rules and navigation affordances
- Updated docs and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active manager and admin users can open the new `Team Payroll` route.
- Payroll estimates follow the documented calculation rules for default rates, overrides, overtime, dedupe, and missing actual time.
- The repo verification baseline still passes.

Known gaps:

- The shipped slice uses deterministic seed data because the tracked schema does not yet include the needed work-time and assignment tables.
- `My Payroll` remains a follow-up that can reuse the same calculation model later.

## Done Criteria

- The app contains a manager or admin `Team Payroll` route with a real calculation model behind a query boundary.
- The core payroll rules are protected by focused tests.
- `WORKLOG.md` reflects the shipped read slice and the next follow-up.
