# My Assignments Search and Sort Slice

## Summary

Add local search and sort controls to `My Assignments` on top of the existing tabs and status chips.

## Scope

- Add view-layer assignment search for title, date, positions, and visible status text.
- Add sort chips for `event date` and `status`.
- Keep the existing grouped assignment snapshot shape unchanged.
- Reuse the current list screen instead of adding new routes.
- Refresh worklog archive references.

Out of scope:

- Server-side search
- Saved sorts
- Bulk actions
- New assignment detail routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the my-assignments search/sort slice.
2. Extend the My Assignments filter helpers and regression coverage for local query and sort behavior.
3. Update `My Assignments` with sort chips, a local search field, and the adjusted empty state.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated assignment grouping/filter helpers under `src/features/assignments/model/`
- Updated `My Assignments` UI under `src/features/assignments/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `My Assignments` can narrow the current filtered list by local query.
- `My Assignments` can reorder the current filtered list by date or status.
- Existing top tabs and status chips keep working with the new controls.

Known gaps:

- This is still local client-side filtering on the loaded assignments snapshot.

## Done Criteria

- `My Assignments` supports local search and sort.
- The slice is committed and pushed after verification.
