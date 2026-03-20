# My Assignments Slice Summary

## Goal

Add the first employee-only `My Assignments` workflow so active employees can review their own grouped schedule assignments from a dedicated route.

## Shipped

- Added `src/app/my-assignments.tsx` and extended auth-route access so active employees can open the new assignments route.
- Added the grouping model in `src/features/assignments/model/my-assignments.ts`.
- The model now:
  - groups same-schedule multi-position assignments into one schedule card
  - keeps the highest-priority status for the grouped card
  - splits the view into upcoming and past schedules
- Added `src/features/assignments/api/fetch-my-assignments.ts` with live Supabase reads plus a safe seeded fallback.
- Added `src/features/assignments/ui/my-assignments-screen.tsx`.
- Added the employee home entry point for `My Assignments`.
- Updated the screen IA note to reflect the grouped-card behavior of the first shipped slice.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the app now contains an employee-only grouped assignments route.

## Residual Risk

- `My Assignments` still falls back to the seeded snapshot until the scheduling/payroll read migration is applied to the real Supabase project.
- `Assignment Detail` and cancellation request mutations are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the shared scheduling/payroll read migration to the real Supabase project so `My Assignments` and both payroll routes stop falling back to seed data.
- Implement `Assignment Detail` and cancellation request flows on top of the new grouped employee assignment path.
- Continue the broader scheduling feature rollout on the tracked schema.
