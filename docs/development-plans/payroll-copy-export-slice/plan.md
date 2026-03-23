# Payroll Copy Export Slice

## Summary

Add copyable CSV export actions for the currently visible `Team Payroll` and `My Payroll` views.

## Scope

- Add shared payroll CSV helpers for visible member/shift rows.
- Reuse `expo-clipboard` to copy the current payroll view as CSV text.
- Wire copy-export actions into both payroll screens without changing the query shape.
- Refresh worklog archive references.

Out of scope:

- File downloads
- Date-period payroll filters
- Payroll approval workflows
- Tax or payslip logic

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the payroll copy export slice.
2. Extend the shared payroll model with CSV export helpers and focused regression coverage.
3. Update `Team Payroll` and `My Payroll` with copy-export actions and inline notices.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated payroll model helpers under `src/features/payroll/model/`
- Updated payroll UI under `src/features/payroll/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Team Payroll` can copy the visible filtered payroll rows as CSV.
- `My Payroll` can copy the visible filtered payroll rows as CSV.
- Existing payroll filters and calculations remain unchanged.

Known gaps:

- This is clipboard-based export, not a downloaded file flow.

## Done Criteria

- Both payroll screens support copyable CSV export.
- The slice is committed and pushed after verification.
