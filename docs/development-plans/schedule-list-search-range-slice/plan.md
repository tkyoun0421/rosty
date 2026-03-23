# Schedule List Search and Date-Range Slice

## Summary

Add local search and date-range filtering to `Schedule List` on top of the existing tabs and collection chips.

## Scope

- Add view-layer schedule list search for title, date, and visible status text.
- Add date-range chips for `all / next 7 days / later / past`.
- Reuse the existing schedule snapshot without changing fetch/query shape or adding a migration.
- Refresh worklog archive references.

Out of scope:

- Server-side search
- Saved filter presets
- Calendar-range pickers
- New schedule list routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the schedule-list search/range slice.
2. Extend the schedule list filter helpers and regression tests with date-range and query matching.
3. Update `Schedule List` with date chips, a local search field, and the adjusted empty state.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated schedule list helpers under `src/features/schedules/model/`
- Updated `Schedule List` UI under `src/features/schedules/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Schedule List` can narrow the current filtered list by date-range chip and local query.
- Existing status tabs and collection chips keep working with the new controls.
- Existing schedule detail navigation remains unchanged.

Known gaps:

- This is still local client-side filtering on the loaded schedule snapshot.

## Done Criteria

- `Schedule List` supports date-range chips and local search.
- The slice is committed and pushed after verification.
