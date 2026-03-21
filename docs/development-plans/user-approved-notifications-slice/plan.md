# User Approved Notifications Slice

## Summary

Patch admin approval so newly approved users receive a `user_approved` inbox notification.

## Scope

- Patch `admin_manage_member` so the approve action inserts a notification row.
- Reuse the existing `notifications` table and enum without changing the member-management UI flow.
- Update the local notifications fallback so the new type is visible before remote rollout.
- Refresh IA/worklog archive references.

Out of scope:

- Push delivery
- Suspend/reactivate notifications
- Notification preferences
- Approval reminder nudges

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the user-approved notifications slice.
2. Patch `admin_manage_member` through a new migration and add focused artifact coverage.
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

- Approving a member enqueues a `user_approved` notification.
- Approved employees route to `/employee-home` and non-employee approved users route to `/manager-home`.
- The local fallback inbox can display the new type.

Known gaps:

- Live behavior still depends on applying the new approval patch migration to the real Supabase project.

## Done Criteria

- The approval flow has a tracked inbox-notification path.
- The local fallback inbox also shows the `user_approved` type.
- The slice is committed and pushed after verification.
