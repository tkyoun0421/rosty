# Schedule Updated Notifications Slice

## Summary

Add `schedule_updated` inbox notifications so editable schedule changes produce a visible alert for affected employees.

## Scope

- Add `schedule_updated` to the tracked notification type contract.
- Add a `schedules` update trigger that enqueues notifications when a collecting schedule changes core visible fields while remaining editable.
- Update the app notification type surface and fallback inbox snapshot.
- Refresh worklog archive references.

Out of scope:

- Push delivery
- Slot-level diff notifications
- Notification settings UI
- Realtime transport

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the schedule-updated notifications slice.
2. Add a migration that extends `notification_type` and registers the schedule update trigger.
3. Update app notification types, fallback data, and product docs for the new schedule-update notification.
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

- The tracked schema contains `schedule_updated` in `notification_type`.
- Collecting schedule edits to core visible fields enqueue notifications for active employees.
- The app type surface accepts the new notification item without changing inbox routing.

Known gaps:

- Live behavior still depends on applying the new notification migration to the real Supabase project.

## Done Criteria

- `schedule_updated` notifications are repo-tracked and app-supported.
- The slice is committed and pushed after verification.
