# Schedule Create Edit Slice Summary

## Goal

Add the first manager/admin `Schedule Create/Edit` workflow so operators can create a schedule from the tracked slot preset baseline, adjust slot configuration, and save updates while the schedule remains editable.

## Shipped

- Added `src/app/schedule-edit.tsx` and manager/admin route access.
- Added the schedule edit form/model helpers under `src/features/schedules/model/schedule-edit.ts`.
- Added the schedule save path under `src/features/schedules/api/save-schedule.ts` and `src/features/schedules/api/use-save-schedule-mutation.ts`.
- Extended the local schedule fallback state with tracked slot preset seed rows.
- Added the new create/edit screen under `src/features/schedules/ui/schedule-edit-screen.tsx`.
- Added manager-home entry for creating a schedule and schedule-detail entry for editing an existing schedule.
- Validation now blocks past dates, invalid package counts, no enabled slots, and schedules with no enabled required slots.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and the app now contains the first manager/admin schedule create/edit route with save behavior.

## Residual Risk

- Live writes still depend on applying the shared scheduling/payroll migration to the real Supabase project.
- The first slice uses the tracked slot preset seed baseline rather than a live slot preset management flow.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the shared scheduling/payroll migration to the real Supabase project.
- Add slot preset management or richer schedule edit constraints if needed.
- Continue the broader scheduling write rollout.
