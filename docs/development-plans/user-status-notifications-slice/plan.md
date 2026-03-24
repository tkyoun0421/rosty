# User Status Notifications Slice

## Summary

Add `user_suspended` and `user_reactivated` inbox notifications so admin member-status actions leave a visible audit trail for the affected user.

## Scope

- Add `user_suspended` and `user_reactivated` to the tracked notification type contract.
- Patch `admin_manage_member(...)` so suspend/reactivate actions enqueue notifications.
- Update the app notification type surface and fallback inbox snapshot.
- Refresh worklog archive references.

Out of scope:

- Push delivery
- Role-change notifications
- Notification settings UI
- Real-time transport

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the user-status notifications slice.
2. Add a migration that extends `notification_type` and patches `admin_manage_member(...)`.
3. Update app notification types, fallback data, and product docs for the new access-state notifications.
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

- The tracked schema contains `user_suspended` and `user_reactivated` in `notification_type`.
- Admin suspend/reactivate actions enqueue notifications for the affected member.
- The app type surface accepts the new notification items without changing the inbox route.

Known gaps:

- Live behavior still depends on applying the new notification migration to the real Supabase project.

## Done Criteria

- The new access-state notifications are repo-tracked and app-supported.
- The slice is committed and pushed after verification.
