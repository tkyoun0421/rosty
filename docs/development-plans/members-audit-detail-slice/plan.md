# Members Audit Detail Slice

## Summary

Add inline audit detail to `Members` so admins can read when a member profile was created and when access was approved.

## Scope

- Extend the member record surface with `createdAt`.
- Add helper formatting for created/approved audit metadata.
- Show the audit detail inside each member card without changing the current admin actions.
- Refresh worklog archive references.

Out of scope:

- Bulk member actions
- Audit log history tables
- Admin action reason capture
- Notification changes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the members audit-detail slice.
2. Extend the members model and regression coverage with audit-detail formatting.
3. Update `Members` so member cards surface created/approved metadata inline.
4. Run verification, then commit the slice.

## Data / Interface Impact

- Updated member fetch mapping under `src/features/members/api/`
- Updated member helpers under `src/features/members/model/`
- Updated `Members` UI under `src/features/members/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Members` cards show created and approved audit detail.
- Pending users show a clear pending approval state instead of an empty approved date.
- Existing member filters and admin actions remain unchanged.

Known gaps:

- This is still inline audit detail only, not a separate audit history flow.

## Done Criteria

- `Members` surfaces audit detail inline.
- The slice is committed after verification.
