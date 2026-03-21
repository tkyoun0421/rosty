# Availability Collection Toggle Slice Summary

## Goal

Add the first manager/admin control for opening and locking schedule availability collection directly from `Schedule Detail`.

## Shipped

- Added collection-state helpers in `src/features/availability/model/availability-collection.ts`.
- Added the collection update API and mutation path in `src/features/availability/api/`.
- Updated `src/features/schedules/ui/schedule-detail-screen.tsx` so manager/admin can lock or reopen collection while a schedule is still `collecting`.
- Refreshed stale `Schedule Detail` copy and updated the IA/worklog archive references.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and `Schedule Detail` now contains the first collection open/lock control for manager/admin.

## Residual Risk

- Live collection toggling still depends on the tracked scheduling schema being applied to the real Supabase project.
- Collection changes do not yet trigger notifications or automatic reminders.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked scheduling migrations to the real Supabase project.
- Decide whether the next staffing slice is collection notifications, richer assignment exceptions, or push registration.
