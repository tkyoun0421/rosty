# Schedule Updated Notifications Slice Summary

## Goal

Add `schedule_updated` inbox notifications so editable schedule changes produce a visible alert for affected employees.

## Shipped

- Added `supabase/migrations/20260324110000_schedule_updated_notifications.sql`.
- Extended the tracked notification type contract with `schedule_updated`.
- Added a `schedules` update trigger that enqueues notifications when a collecting schedule changes core visible fields while remaining editable.
- Updated the app notification type surface and fallback inbox snapshot.
- Updated current archive notes for the richer schedule-change notification flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-24, and the app now contains the first schedule-updated notification path.

## Residual Risk

- Live behavior still depends on applying the new notification migration to the real Supabase project.
- Push delivery is still unimplemented.
- Device-token registration is still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.

## Follow-up

- Apply the tracked notification migration to the real Supabase project.
- Decide whether the next notification slice is push registration, saved filters, or another staffing alert flow.
