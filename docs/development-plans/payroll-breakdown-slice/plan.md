# Payroll Breakdown Slice

## Summary

Expose `regular pay` and `overtime pay` breakdowns in the shared payroll snapshots and both payroll screens.

## Scope

- Extend the existing payroll snapshot model with pay breakdown fields.
- Reuse the current payroll calculation rules without changing the underlying rate policy behavior.
- Show the new breakdown values in both `Team Payroll` and `My Payroll`.
- Refresh worklog and archive references.

Out of scope:

- Payroll period filters
- Export/download
- Real settlement or deductions
- New payroll routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the payroll-breakdown slice.
2. Extend the payroll snapshot model and regression tests with regular/overtime pay fields.
3. Update `Team Payroll` and `My Payroll` to display the new breakdown.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated payroll model tests under `src/features/payroll/model/`
- Updated `Team Payroll` and `My Payroll` UI under `src/features/payroll/ui/`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Payroll snapshots include regular and overtime pay totals.
- Team and personal payroll screens show the new breakdown values.
- Existing overtime math remains unchanged.

Known gaps:

- Live behavior still depends on the tracked scheduling/payroll schema being applied to the real Supabase project.

## Done Criteria

- Shared payroll snapshots expose regular/overtime pay breakdowns.
- Both payroll screens surface the new breakdown values.
- The slice is committed and pushed after verification.
