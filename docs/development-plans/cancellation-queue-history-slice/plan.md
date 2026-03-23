# Cancellation Queue History Slice

## Summary

Extend `Cancellation Queue` so managers/admins can switch between pending review and reviewed request history.

## Scope

- Expand the queue read path from pending-only to all review statuses.
- Add view-layer queue filtering for `pending / reviewed` plus reviewed-status chips.
- Keep the existing approve/reject mutation flow unchanged.
- Refresh worklog archive references.

Out of scope:

- Search inside the queue
- Review timestamps in the UI
- Bulk review actions
- New queue routes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the cancellation-queue-history slice.
2. Add queue filter helpers and focused regression coverage.
3. Update `Cancellation Queue` with `pending / reviewed` tabs, reviewed chips, and filtered empty states.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated cancellation queue model helpers under `src/features/assignments/model/`
- Updated queue read path under `src/features/assignments/api/`
- Updated `Cancellation Queue` UI under `src/features/assignments/ui/`
- Updated worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Managers/admins can switch between pending and reviewed cancellation requests.
- Reviewed requests can be narrowed to approved or rejected.
- Pending requests remain reviewable and reviewed requests stay read-only.

Known gaps:

- Live behavior still depends on the tracked cancellation migrations being applied to the real Supabase project.

## Done Criteria

- `Cancellation Queue` supports both pending and reviewed views.
- The slice is committed and pushed after verification.
