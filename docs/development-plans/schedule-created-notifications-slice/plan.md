# Schedule Created Notifications Slice

## Summary

Patch schedule creation so newly inserted schedules enqueue `schedule_created` inbox notifications for active employees.

## Scope

- Add a trigger-based migration on `public.schedules` inserts.
- Reuse the existing `notifications` table and enum without changing the schedule create UI route.
- Update the local notifications fallback so the new type is visible before remote rollout.
- Refresh IA/worklog archive references.

Out of scope:

- Push delivery
- Schedule-update notifications
- Notification preferences
- Trigger-side dedupe for repeated edits

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the schedule-created notifications slice.
2. Add the schedules insert trigger migration and focused artifact coverage.
3. Update the fallback notifications inbox so the new type is visible in local testing.
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

- New schedules enqueue `schedule_created` notifications for active employees.
- The notifications inbox can display the new type through both live and fallback paths.
- Existing schedule create/edit behavior stays unchanged.

Known gaps:

- Live behavior still depends on applying the new trigger migration to the real Supabase project.

## Done Criteria

- Schedule creation has a tracked inbox-notification path.
- The local fallback inbox also shows the `schedule_created` type.
- The slice is committed and pushed after verification.
