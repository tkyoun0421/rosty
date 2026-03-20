# Payroll Read Rollout Summary

## Goal

Add the tracked read schema Team Payroll expects, then switch the Team Payroll query from a seeded-only snapshot to a real Supabase read path with a safe fallback while the rollout is still unapplied.

## Shipped

- Added `supabase/migrations/20260320130000_payroll_read_schema_rollout.sql`.
- The new migration adds the tracked enums and tables needed by the current payroll read path:
  - `slot_presets`
  - `schedules`
  - `schedule_slots`
  - `assignments`
  - `schedule_time_records`
- Added the minimum read-side RLS and manager or admin write policies for those tables.
- Updated `src/features/payroll/api/fetch-team-payroll.ts` so the app now:
  - uses live Supabase reads when the new tables and policy row are available
  - falls back to the deterministic seeded snapshot when the rollout is not ready yet
  - exposes the current source state to the UI
- Added focused regression coverage for the live row mapping and the new migration artifact.
- Kept the shipped `Team Payroll` route read-only.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and Team Payroll can now switch to real Supabase reads automatically after the new migration is applied.

## Residual Risk

- The new payroll read migration still has to be applied to the real Supabase project before Team Payroll stops falling back to the seeded snapshot there.
- `My Payroll` is still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply `20260320130000_payroll_read_schema_rollout.sql` to the real Supabase project and confirm Team Payroll switches from seed fallback to live reads.
- Reuse the live payroll query path and calculation model for `My Payroll`.
- Continue the scheduling feature rollout on top of the newly tracked tables.
