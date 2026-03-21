# Employee Work Time Read Slice Summary

## Goal

Expose the current schedule-level work-time record as a read-only section inside `Assignment Detail` for employees.

## Shipped

- Added read-only work-time display helpers in `src/features/work-time/model/work-time.ts`.
- Updated `src/features/assignments/ui/assignment-detail-screen.tsx` so employees can review planned and actual schedule-level work time.
- Reused the existing `useWorkTimeQuery(scheduleId)` read path without opening any new employee write surface.
- Updated current archive notes for the richer employee assignment detail flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and employees can now read schedule-level work-time details from `Assignment Detail`.

## Residual Risk

- Live behavior still depends on the shared scheduling schema being applied to the real Supabase project.
- Employees still do not have a dedicated standalone work-time screen.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked scheduling migrations to the real Supabase project.
- Decide whether the next employee slice is richer payroll detail, work-time history, or another read-only operations view.
