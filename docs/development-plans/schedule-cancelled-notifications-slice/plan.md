# Schedule Cancelled Notifications Slice

## Summary

Add `schedule_cancelled` inbox notifications so affected employees are told when an operator cancels a schedule.

## Scope

- Add `schedule_cancelled` to the tracked notification type contract.
- Patch `cancel_schedule_operation(...)` so confirmed assignees receive one notification per cancelled schedule.
- Keep the existing notification inbox route and UI unchanged.
- Refresh worklog archive references.

Out of scope:

- Push delivery
- Schedule-update notifications
- Auto-resolving pending cancellation requests
- New notification settings UI

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the schedule-cancelled notifications slice.
2. Add a migration that extends `notification_type` and patches `cancel_schedule_operation(...)`.
3. Update notification app types/docs and the fallback inbox snapshot for the new notification type.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- New migration under `supabase/migrations/`
- Updated notification model/fallback under `src/features/notifications/`
- Updated product docs and worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- The tracked schema contains `schedule_cancelled` in `notification_type`.
- Schedule cancellation enqueues notifications only for affected confirmed assignees.
- The app type surface accepts the new notification item without changing the inbox UI.

Known gaps:

- Live behavior still depends on applying the new migration to the real Supabase project.

## Done Criteria

- `schedule_cancelled` notifications are repo-tracked and app-supported.
- The slice is committed and pushed after verification.
