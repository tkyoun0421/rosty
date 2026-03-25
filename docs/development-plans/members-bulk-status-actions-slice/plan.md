# Members Bulk Status Actions Slice

## Summary

Extend the first bulk member action so admins can bulk approve, suspend, or reactivate the eligible members in the current filtered view.

## Scope

- Add helpers for the currently approvable, suspendable, and reactivatable member subsets.
- Reuse the existing admin mutation path for each visible eligible member.
- Surface bulk approve, suspend, and reactivate action cards in `Members` when the current filtered view contains eligible users.
- Refresh worklog archive references.

Out of scope:

- Bulk role changes
- Server-side batching RPC
- Reason capture or confirmation modals
- Audit-log table changes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the members bulk-status-actions slice.
2. Extend the members model/test coverage with suspendable and reactivatable subset helpers.
3. Update `Members` with bulk suspend/reactivate actions while keeping the existing bulk approve path.
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

- `Members` can identify the suspendable and reactivatable users in the current filtered view.
- Admins can trigger bulk approve, suspend, and reactivate flows from the current filtered view.
- Existing single-member actions remain unchanged.

Known gaps:

- This is still client-driven sequential execution, not a server-side batch RPC.

## Done Criteria

- `Members` supports the first bulk status action set.
- The slice is committed and pushed after verification.
