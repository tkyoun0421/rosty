# User Approved Notifications Slice Summary

## Goal

Patch admin approval so newly approved users receive a `user_approved` inbox notification.

## Shipped

- Added `supabase/migrations/20260321123000_user_approved_notifications.sql`.
- Patched `admin_manage_member` so the approve action enqueues `user_approved` notifications.
- Routed approved employees to `/employee-home` and non-employee approved users to `/manager-home`.
- Updated the local notifications fallback snapshot so `user_approved` is visible before remote rollout.
- Updated current archive notes for the richer staffing notification flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and admin approval now has a tracked inbox-notification path.

## Residual Risk

- Live inbox behavior still depends on applying the approval patch migration to the real Supabase project.
- Suspend/reactivate notifications and push delivery are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked user-approved notifications migration to the real Supabase project.
- Decide whether the next notification slice is suspend/reactivate notifications, push registration, or another staffing alert flow.
