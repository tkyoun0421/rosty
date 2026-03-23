# Members Filter Slice

## Summary

Add the shared `top tab + chip` filtering structure to `Members`.

## Scope

- Add view-layer filtering for `all / pending / active / suspended / deactivated`.
- Add role chips for `all / employee / manager / admin`.
- Keep the current member mutation behavior unchanged.
- Refresh worklog archive references.

Out of scope:

- Search inside Members
- Bulk member actions
- Audit logs
- New admin routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the members-filter slice.
2. Add filter helpers and focused regression coverage in the members model.
3. Update `Members` with top tabs, role chips, and filtered empty states.
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

- `Members` supports the new top tabs and role chips.
- Filtered member views show consistent counts and empty states.
- Existing member actions remain intact.

Known gaps:

- Search and bulk member actions are still unimplemented.

## Done Criteria

- `Members` uses the shared filter pattern.
- The slice is committed and pushed after verification.
