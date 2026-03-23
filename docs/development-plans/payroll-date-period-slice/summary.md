# Payroll Date-Period Slice Summary

## Goal

Add month-based period chips to `Team Payroll` and `My Payroll` on top of the existing `all / estimated / pending` tabs.

## Shipped

- Extended the shared payroll model with schedule-date-aware month-period filtering.
- Added focused regression coverage for current, future, and past month filtering.
- Updated `src/features/payroll/ui/team-payroll-screen.tsx` and `src/features/payroll/ui/my-payroll-screen.tsx` with `all / current month / future months / past months` chips.
- Updated current archive notes for the richer payroll browsing flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-23, and both payroll screens now support month-period filtering on top of the existing tabs.

## Residual Risk

- This is still local client-side period filtering on the loaded payroll snapshot.
- Live payroll behavior still depends on the tracked scheduling/payroll schema being applied to the real Supabase project.
- Push delivery and device-token registration are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.

## Follow-up

- Apply the tracked scheduling/payroll migrations to the real Supabase project.
- Decide whether the next payroll slice is downloadable export, saved period presets, or another operator summary affordance.
