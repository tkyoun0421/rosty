# Availability Collection Toggle Slice

## Summary

Add the first manager/admin control for opening and locking schedule availability collection directly from `Schedule Detail`.

## Scope

- Add the schedule collection-state update API and mutation path.
- Reuse the tracked `schedules.collection_state` field instead of adding new schema.
- Expose an operator action in `Schedule Detail` for manager/admin while the schedule is still `collecting`.
- Refresh related docs and worklog references.

Out of scope:

- Automatic close deadlines
- Batch collection management
- Notifications for collection open/lock changes
- A separate dedicated availability-collection screen

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the collection toggle slice.
2. Add the collection update API/mutation and focused helper tests.
3. Wire the manager/admin toggle into `Schedule Detail` and refresh the stale copy there.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- New availability API/model files under `src/features/availability/`
- Updated `Schedule Detail` operator actions under `src/features/schedules/ui/`
- Updated screen IA notes and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Manager/admin can open or lock collection while a schedule is still `collecting`.
- Employees remain blocked from that control.
- Related schedule, availability, and assignment views invalidate after a change.

Known gaps:

- Live behavior still depends on the tracked scheduling schema being applied to the real Supabase project.

## Done Criteria

- `Schedule Detail` exposes the first collection open/lock control.
- The control reuses the tracked collection-state field and refreshes dependent reads.
- The slice is committed and pushed after verification.
