# Notifications Inbox Slice Summary

## Goal

Add the first active-user `Notifications` inbox so users can read in-app notifications from a dedicated route, and wire the current cancellation request/review flows to create notification rows.

## Shipped

- Added `src/app/notifications.tsx` and active-user route access for the inbox.
- Added the notifications query, model, mark-as-read mutation, and inbox UI under `src/features/notifications/`.
- Added home entry points for employee and manager/admin users.
- Added `supabase/migrations/20260320143000_notifications_inbox_rollout.sql`.
- The new migration adds:
  - `notification_type`
  - `notifications`
  - self read/update RLS for notification rows
  - patched `request_assignment_cancellation(...)` notification inserts for manager/admin reviewers
  - patched `review_cancellation_request(...)` notification inserts for the requesting employee
- Added focused regression coverage for the notifications model and the migration artifact.
- Updated the screen IA note to describe the first shipped inbox scope.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the app now contains an inbox route for active users with cancellation-flow notification generation tracked in repo migrations.

## Residual Risk

- The shared scheduling/payroll migration and all three cancellation/notification migrations still need to be applied to the real Supabase project before the live inbox stops using fallback or missing rows there.
- Push delivery is still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the shared scheduling/payroll migration plus the cancellation/notification migrations to the real Supabase project.
- Add notification side-effects for additional flows such as user approval or assignment confirmation.
- Decide whether the next cross-cutting slice is push token registration or richer schedule/detail UX.
