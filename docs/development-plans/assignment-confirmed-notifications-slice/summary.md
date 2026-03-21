# Assignment Confirmed Notifications Slice Summary

## Goal

Patch the current schedule-confirm flow so confirmed assignments enqueue `assignment_confirmed` notifications for affected employees.

## Shipped

- Added `supabase/migrations/20260321113000_assignment_confirmed_notifications.sql`.
- Patched `confirm_schedule_assignments` so employee inbox rows are created when a schedule is confirmed.
- Deduped notifications per assignee for the same schedule confirmation event.
- Updated the local notifications fallback snapshot so `assignment_confirmed` is visible before remote rollout.
- Updated current archive notes for the richer staffing notification flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and assignment confirmation now has a tracked inbox-notification path.

## Residual Risk

- Live inbox behavior still depends on applying the notifications patch migration to the real Supabase project.
- `schedule_created` notifications and push delivery are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked notifications patch migration to the real Supabase project.
- Decide whether the next notification slice is `schedule_created`, push registration, or richer staffing reminders.
