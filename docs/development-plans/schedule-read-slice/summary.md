# Schedule Read Slice Summary

## Goal

Add the first shared `Schedule List` and `Schedule Detail` read workflow so active users can browse tracked schedules and open a detail screen before the later availability, work-time, or editing slices land.

## Shipped

- Added `src/app/schedules.tsx` and `src/app/schedule-detail.tsx`.
- Added shared schedule list/detail query paths under `src/features/schedules/api/`.
- Added shared schedule list/detail UI under `src/features/schedules/ui/`.
- Added the schedule read model helpers under `src/features/schedules/model/`.
- Added employee and manager/admin home entry points for the schedule list.
- Extended auth-route access so active users can open the new routes.
- Updated the screen IA note to describe the first shipped schedule read slice.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the app now contains shared read-only schedule list/detail routes.

## Residual Risk

- Live schedule reads still depend on applying the shared scheduling/payroll migration to the real Supabase project.
- Availability submission, work-time editing, schedule edit/create, and assignment workspace actions remain later slices.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the shared scheduling/payroll migration to the real Supabase project.
- Implement availability submissions or work-time editing on top of the schedule detail route.
- Continue the broader scheduling feature rollout.
