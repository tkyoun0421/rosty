# My Payroll Slice

## Summary

Add the first employee-only `My Payroll` workflow by reusing the shared payroll calculation model and query path behind a filtered personal estimate view.

## Scope

- Add a protected `My Payroll` route for active employees.
- Reuse the current Team Payroll query path and calculation model instead of creating a second payroll engine.
- Show the current employee estimate summary plus per-schedule breakdown from the shared payroll snapshot.
- Add an entry point from the current employee home screen.

Out of scope:

- Manager or admin access to `My Payroll`
- Export, settlement, tax, or payslip features
- Account settings or notifications work
- Additional payroll schema changes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the `My Payroll` slice.
2. Implement the employee-only payroll query or filtered selector on top of the current shared payroll snapshot.
3. Add the `My Payroll` route and screen plus the employee home entry point.
4. Add focused regression coverage, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New employee route under `src/app/`
- New payroll UI or model files under `src/features/payroll/`
- Updated auth-route access rules and employee home navigation
- Updated docs and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active employees can open the new `My Payroll` route.
- The route shows only the current employee payroll estimate from the shared payroll snapshot.
- The repo verification baseline still passes.

Known gaps:

- The route still inherits the current Team Payroll fallback behavior until the live payroll migration is applied.

## Done Criteria

- The app contains an employee-only `My Payroll` route backed by the shared payroll calculation path.
- Access rules and filtering behavior are protected by focused tests.
- `WORKLOG.md` reflects the completed `My Payroll` slice and the next follow-up.
