# Payroll Copy Export Slice Summary

## Goal

Add copyable CSV export actions for the currently visible `Team Payroll` and `My Payroll` views.

## Shipped

- Added shared payroll CSV export helpers in `src/features/payroll/model/team-payroll.ts`.
- Added focused regression coverage for team/member CSV export output.
- Updated `src/features/payroll/ui/team-payroll-screen.tsx` and `src/features/payroll/ui/my-payroll-screen.tsx` with copy-export actions and inline notices.
- Updated current archive notes for the richer payroll handoff flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-23, and both payroll screens now support copyable CSV export for the current visible view.

## Residual Risk

- This is clipboard-based export, not a downloaded file flow.
- Payroll date-period filtering is still unimplemented.
- Live payroll behavior still depends on the tracked scheduling/payroll schema being applied to the real Supabase project.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.

## Follow-up

- Apply the tracked scheduling/payroll migrations to the real Supabase project.
- Decide whether the next payroll slice is date-period filtering, saved export presets, or another operations summary affordance.
