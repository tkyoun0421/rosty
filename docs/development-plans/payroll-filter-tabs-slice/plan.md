# Payroll Filter Tabs Slice

## Summary

Add `all / estimated / pending actual time` filter tabs to both payroll screens.

## Scope

- Reuse the existing payroll snapshot model and add view-layer filtering helpers.
- Add top tabs to `Team Payroll` and `My Payroll`.
- Recompute visible summary totals from the filtered subset instead of the full snapshot.
- Refresh worklog archive references.

Out of scope:

- Date or pay-period filters
- Export/download
- New payroll routes
- Settlement or deduction logic

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the payroll-filter-tabs slice.
2. Add view-layer filter helpers and focused regression tests to the payroll model.
3. Update `Team Payroll` and `My Payroll` to render the new tabs and filtered summaries.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated payroll model helpers under `src/features/payroll/model/`
- Updated `Team Payroll` and `My Payroll` UI under `src/features/payroll/ui/`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Both payroll screens can toggle between all, estimated, and pending views.
- Filtered summaries reflect only the visible subset.
- Existing payroll math remains unchanged.

Known gaps:

- Live behavior still depends on the tracked scheduling/payroll schema being applied to the real Supabase project.

## Done Criteria

- Both payroll screens expose the new tabs.
- Filtered payroll summaries and cards stay internally consistent.
- The slice is committed and pushed after verification.
