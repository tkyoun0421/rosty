# Availability Overview Slice Summary

## Goal

Add the first manager/admin `Availability Overview` workflow so managers and admins can review slot-by-slot candidate coverage from the tracked scheduling and availability schema.

## Shipped

- Added `src/app/availability-overview.tsx` and manager/admin route access.
- Added the availability overview query and grouping model under `src/features/availability/`.
- The overview now:
  - filters candidates by slot `requiredGender`
  - keeps `available` candidates in the primary section
  - moves `unavailable` and `not_responded` candidates into a support section
  - calculates per-slot vacancy counts from the current available pool
- Updated `Schedule Detail` so manager/admin users can open the overview from the schedule screen.
- Reused the tracked scheduling/availability schema with safe seeded fallback until the real migrations are applied.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the app now contains the first manager/admin availability overview route.

## Residual Risk

- The shared scheduling/payroll migration and the availability migration still need to be applied to the real Supabase project before the live overview stops using fallback there.
- Assignment workspace integration is still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the shared scheduling/payroll migration and the availability migration to the real Supabase project.
- Implement `Assignment Workspace` or a richer staffing action flow on top of the new overview route.
- Continue the broader scheduling feature rollout.
