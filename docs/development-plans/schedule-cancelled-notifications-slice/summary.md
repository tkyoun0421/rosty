# Schedule Cancelled Notifications Slice Summary

## Goal

Add `schedule_cancelled` inbox notifications so affected employees are told when an operator cancels a schedule.

## Shipped

- Added `supabase/migrations/20260323110000_schedule_cancelled_notifications.sql`.
- Extended the tracked notification type contract with `schedule_cancelled`.
- Patched `cancel_schedule_operation(...)` so confirmed assignees receive one schedule-cancelled notification per cancelled schedule.
- Updated the app notification type surface and fallback inbox snapshot.
- Updated current archive notes for the richer staffing interruption flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-23, and the app now contains the first schedule-cancelled notification path.

## Residual Risk

- Live behavior still depends on applying the new notification migration to the real Supabase project.
- Push delivery is still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked notification migration to the real Supabase project.
- Decide whether the next notification slice is schedule-update alerts, suspend/reactivate alerts, or push registration.
