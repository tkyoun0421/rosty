# Schedule Created Notifications Slice Summary

## Goal

Patch schedule creation so newly inserted schedules enqueue `schedule_created` inbox notifications for active employees.

## Shipped

- Added `supabase/migrations/20260321120000_schedule_created_notifications.sql`.
- Added an `after insert` trigger on `public.schedules` that enqueues employee `schedule_created` inbox rows.
- Updated the local notifications fallback snapshot so `schedule_created` is visible before remote rollout.
- Updated current archive notes for the richer staffing notification flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and schedule creation now has a tracked inbox-notification path.

## Residual Risk

- Live inbox behavior still depends on applying the trigger migration to the real Supabase project.
- Schedule-update notifications and push delivery are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked schedule-created notifications migration to the real Supabase project.
- Decide whether the next notification slice is schedule-update reminders, push registration, or another staffing alert flow.
