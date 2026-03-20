# Team Payroll Read Slice Summary

## Goal

Add the first manager or admin `Team Payroll` workflow as a read-only slice so the app can show the payroll calculation rules and team estimate structure before the tracked assignment and work-time schema lands in Supabase.

## Shipped

- Added `src/app/team-payroll.tsx` and extended auth-route access so active manager and admin users can open the new payroll route.
- Added a payroll calculation model in `src/features/payroll/model/team-payroll.ts`.
- The model now applies the current documented rules for:
  - member override before hall default
  - overtime threshold and multiplier
  - duplicate same-schedule assignments counting once for time
  - missing actual time staying pending
  - cancelled assignments being excluded
- Added a deterministic server-shaped query boundary in `src/features/payroll/api/fetch-team-payroll.ts`.
- Added the new `Team Payroll` UI in `src/features/payroll/ui/team-payroll-screen.tsx`.
- Added entry points from `Manager Home` and `Pay Policy`.
- Updated the screen IA and schema notes to state that this first payroll slice is read-only and currently uses a seeded snapshot.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the app now contains a manager or admin payroll estimate route with tested calculation rules.

## Residual Risk

- The shipped payroll slice uses deterministic seed data because the tracked Supabase migrations still do not include the `assignments` and `schedule_time_records` tables described in product docs.
- `My Payroll` is still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Lock the scheduling read-schema rollout that adds the tracked assignment and work-time tables needed for real payroll reads.
- Reuse the same calculation model for `My Payroll`.
- Re-run the real Google OAuth round-trip and first-admin bootstrap when a device path is available.
