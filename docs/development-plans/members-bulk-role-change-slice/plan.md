# Members Bulk Role Change Slice

## Summary

Extend the bulk member action set so admins can apply role changes to the eligible members in the current filtered view.

## Scope

- Add helpers for the currently role-changeable subset per target role.
- Reuse the existing single-member role-change mutation path for each visible eligible member.
- Surface bulk role-change action cards for `employee / manager / admin` inside `Members`.
- Refresh worklog archive references.

Out of scope:

- Server-side batching RPC
- Confirmation modals
- Bulk actions on deactivated users
- Audit log table changes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the members bulk-role-change slice.
2. Extend the members model/test coverage with role-changeable subset helpers.
3. Update `Members` with bulk role-change actions while keeping the existing bulk status actions intact.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated member helpers under `src/features/members/model/`
- Updated `Members` UI under `src/features/members/ui/`
- Updated product/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Members` can identify the role-changeable users in the current filtered view for each target role.
- Admins can trigger bulk role changes from the current filtered view.
- Existing single-member actions remain unchanged.

Known gaps:

- This is still client-driven sequential execution, not a server-side batch RPC.

## Done Criteria

- `Members` supports the first bulk role-change action set.
- The slice is committed and pushed after verification.
