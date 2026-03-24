# User Status Notifications Slice Summary

## Goal

Add `user_suspended` and `user_reactivated` inbox notifications so admin member-status actions leave a visible audit trail for the affected user.

## Shipped

- Added `supabase/migrations/20260324100000_user_status_notifications.sql`.
- Extended the tracked notification type contract with `user_suspended` and `user_reactivated`.
- Patched `admin_manage_member(...)` so suspend and reactivate actions enqueue access-state notifications.
- Updated the app notification type surface and fallback inbox snapshot.
- Updated current archive notes for the richer member-status notification flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-24, and the app now contains the first suspend/reactivate notification path.

## Residual Risk

- Live behavior still depends on applying the new notification migration to the real Supabase project.
- Push delivery is still unimplemented.
- Schedule-update notifications are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.

## Follow-up

- Apply the tracked notification migration to the real Supabase project.
- Decide whether the next notification slice is schedule-update alerts, push registration, or another staffing alert flow.
