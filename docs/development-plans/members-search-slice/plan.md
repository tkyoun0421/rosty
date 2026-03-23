# Members Search Slice

## Summary

Add local search to `Members` on top of the existing tabs and role chips.

## Scope

- Add view-layer member search for `full name`, `phone number`, and `role`.
- Reuse the existing member snapshot without adding a new query or migration.
- Keep current tabs, chips, and member actions unchanged.
- Refresh worklog archive references.

Out of scope:

- Server-side search
- Fuzzy ranking
- Saved searches
- New admin routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the members-search slice.
2. Extend the member filtering helper and regression tests with local query matching.
3. Add the search field to `Members` and connect it to the existing filtered list.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated member-management helpers under `src/features/members/model/`
- Updated `Members` UI under `src/features/members/ui/`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Members` can narrow the current filtered list by name, phone number, or role text.
- Existing status tabs and role chips keep working with the new query.
- Existing member actions remain unchanged.

Known gaps:

- This is still local client-side filtering on the loaded members snapshot.

## Done Criteria

- `Members` has a local search field.
- The slice is committed and pushed after verification.
