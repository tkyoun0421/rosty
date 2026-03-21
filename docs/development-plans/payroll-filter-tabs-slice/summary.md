# Payroll Filter Tabs Slice Summary

## Goal

Add `all / estimated / pending actual time` filter tabs to both payroll screens.

## Shipped

- Added payroll filtering helpers in `src/features/payroll/model/team-payroll.ts`.
- Extended payroll regression coverage so filtered summaries stay aligned with the existing snapshot math.
- Updated `src/features/payroll/ui/team-payroll-screen.tsx` and `src/features/payroll/ui/my-payroll-screen.tsx` with top filter tabs and filtered empty states.
- Updated current archive notes for the richer payroll navigation flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and both payroll screens now support focused all/estimated/pending views.

## Residual Risk

- Live behavior still depends on the tracked scheduling/payroll schema being applied to the real Supabase project.
- Date-based filters and export flows are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked scheduling/payroll migrations to the real Supabase project.
- Decide whether the next payroll slice is period filtering, export, or another operator-facing detail view.
