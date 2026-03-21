# Assignment Confirmed Notifications Slice

## Summary

Patch the current schedule-confirm flow so confirmed assignments enqueue `assignment_confirmed` notifications for affected employees.

## Scope

- Patch `confirm_schedule_assignments` with notification inserts.
- Reuse the existing `notifications` table and enum without adding a new UI route.
- Update the local notifications fallback so the new type is visible even before remote rollout.
- Refresh the current IA/worklog archive references.

Out of scope:

- Push delivery
- `schedule_created` notifications
- Notification preference controls
- Notification batching beyond per-user schedule confirmation dedupe

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the assignment-confirmed notifications slice.
2. Patch `confirm_schedule_assignments` through a new migration and add focused artifact coverage.
3. Update the local notifications fallback snapshot so the new notification type is visible in local testing.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- New migration under `supabase/migrations/`
- New migration artifact test under `tests/`
- Updated notifications fallback seed under `src/features/notifications/api/`
- Updated IA/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Confirming a schedule enqueues employee `assignment_confirmed` notifications.
- Multiple confirmed seats for the same user on one schedule dedupe to one inbox notification.
- Local fallback inbox shows the new notification type.

Known gaps:

- Live behavior still depends on applying the notifications patch migration to the real Supabase project.

## Done Criteria

- The schedule-confirm path enqueues assignment-confirmed notifications.
- The notifications inbox can display the new type through both live and fallback paths.
- The slice is committed and pushed after verification.
