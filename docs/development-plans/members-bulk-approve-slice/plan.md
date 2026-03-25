# Members Bulk Approve Slice

## Summary

Add the first bulk member action so admins can approve the currently visible pending users in one step.

## Scope

- Add a helper for the currently approvable member subset.
- Reuse the existing admin approval mutation path for each visible pending user.
- Surface one bulk-approve action in `Members` when the current filtered view contains pending users.
- Refresh worklog archive references.

Out of scope:

- Bulk suspend or reactivate
- Bulk role changes
- Server-side batching RPC
- Reason capture or confirmation modals

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the members bulk-approve slice.
2. Extend the members model/test coverage with the approvable subset helper.
3. Update `Members` with a bulk-approve action card and result notice.
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

- `Members` can identify the pending users in the current filtered view.
- Admins can trigger one bulk approve flow for the visible pending set.
- Existing single-member actions remain unchanged.

Known gaps:

- This is still client-driven sequential approval, not a server-side batch RPC.

## Done Criteria

- `Members` supports the first bulk approve action.
- The slice is committed and pushed after verification.
