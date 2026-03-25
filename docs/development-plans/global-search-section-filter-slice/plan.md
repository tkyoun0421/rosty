# Global Search Section Filter Slice

## Summary

Add result-type chips to `Global Search` so users can narrow the current search view to schedules, assignments, or members.

## Scope

- Add shared helper logic for section-type chip visibility.
- Keep the existing search query/fetch path unchanged.
- Update `Global Search` with result-type chips and section-level empty states.
- Refresh worklog archive references.

Out of scope:

- Search ranking changes
- Server-side filters
- Saved searches
- New routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the global-search section-filter slice.
2. Extend the global-search model/test coverage with section-type chip helpers.
3. Update `Global Search` with result-type chips and clearer empty states.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated search helpers under `src/features/search/model/`
- Updated `Global Search` UI under `src/features/search/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Global Search` can narrow the current result view by schedules, assignments, or members.
- Section-level empty states stay readable when a selected result type has no matches.
- Existing search navigation remains unchanged.

Known gaps:

- This is still client-side section filtering on the already loaded search snapshot.

## Done Criteria

- `Global Search` supports result-type chips.
- The slice is committed and pushed after verification.
