# Payroll Date-Period Slice

## Summary

Add month-based period chips to `Team Payroll` and `My Payroll` on top of the existing `all / estimated / pending` tabs.

## Scope

- Extend the shared payroll model with schedule-date-aware filtering.
- Add period chips for `all / current month / future months / past months`.
- Keep the existing payroll query shape unchanged and filter only on the loaded snapshot.
- Refresh worklog archive references.

Out of scope:

- Server-side payroll period queries
- Arbitrary date pickers
- Download export files
- Payroll approval workflows

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the payroll date-period slice.
2. Extend the shared payroll snapshot helpers and regression tests with month-period filtering.
3. Update both payroll screens with period chips and adjusted empty states.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated payroll model helpers under `src/features/payroll/model/`
- Updated payroll query mapping under `src/features/payroll/api/`
- Updated payroll UI under `src/features/payroll/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Team Payroll` can narrow the visible snapshot by month-period chip.
- `My Payroll` can narrow the visible member view by month-period chip.
- Existing payroll tabs and CSV copy export continue to work.

Known gaps:

- This is still local client-side period filtering on the loaded payroll snapshot.

## Done Criteria

- Both payroll screens support month-period filtering.
- The slice is committed and pushed after verification.
