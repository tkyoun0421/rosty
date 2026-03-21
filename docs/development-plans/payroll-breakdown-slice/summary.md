# Payroll Breakdown Slice Summary

## Goal

Expose `regular pay` and `overtime pay` breakdowns in the shared payroll snapshots and both payroll screens.

## Shipped

- Extended the shared payroll snapshot model with `regularPay` and `overtimePay` fields for shifts, members, and summary totals.
- Updated payroll regression coverage so the breakdown values stay locked with the current overtime math.
- Updated `src/features/payroll/ui/team-payroll-screen.tsx` and `src/features/payroll/ui/my-payroll-screen.tsx` to display the new breakdown values.
- Updated current archive notes for the richer payroll read flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and both payroll screens now expose regular/overtime pay breakdowns.

## Residual Risk

- Live behavior still depends on the tracked scheduling/payroll schema being applied to the real Supabase project.
- Payroll period filters and export flows are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked scheduling/payroll migrations to the real Supabase project.
- Decide whether the next payroll slice is period filtering, export, or another operator-facing detail view.
