# My Assignments Filter Slice

## Summary

Add the shared `top tab + chip` filtering structure to `My Assignments`.

## Scope

- Add view-layer filtering for `upcoming / past` plus assignment status chips.
- Keep the existing grouped assignment snapshot shape unchanged.
- Reuse the current list screen instead of adding new routes.
- Refresh worklog archive references.

Out of scope:

- Search inside My Assignments
- Assignment sorting overrides
- Bulk actions
- New assignment detail routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the my-assignments-filter slice.
2. Add filter helpers and focused regression coverage in the My Assignments model.
3. Update `My Assignments` with top tabs, status chips, and filtered empty states.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated assignment grouping helpers under `src/features/assignments/model/`
- Updated `My Assignments` UI under `src/features/assignments/ui/`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `My Assignments` supports `upcoming / past` tabs.
- Status chips filter the grouped assignment cards within the selected tab.
- Filtered empty states remain clear.

Known gaps:

- Live behavior still depends on the tracked scheduling schema being applied to the real Supabase project.

## Done Criteria

- `My Assignments` uses the shared filter pattern.
- The slice is committed and pushed after verification.
