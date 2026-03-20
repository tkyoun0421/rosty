# Availability Submission Slice Summary

## Goal

Add the first employee availability-submission workflow so active employees can open a schedule detail screen, review their current response state, and submit or update an `available`/`unavailable` response while the collection is open.

## Shipped

- Added `supabase/migrations/20260320150000_availability_submission_rpc.sql`.
- The new migration adds:
  - `availability_status`
  - `availability_submissions`
  - employee self read/write and manager/admin read policies
  - `submit_my_availability_response(...)`
- Added the availability query, mutation, and helper model under `src/features/availability/`.
- Updated `src/features/schedules/ui/schedule-detail-screen.tsx` so active employees can see their current response state and submit/update it while collection is open.
- Kept manager/admin schedule detail views read-only.
- Updated the screen IA note to describe the first shipped availability scope.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the app now contains the first employee availability response flow inside schedule detail.

## Residual Risk

- Live availability reads/writes still depend on applying the shared scheduling migration and the new availability migration to the real Supabase project.
- Availability overview for manager/admin remains unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the shared scheduling/payroll migration and the new availability migration to the real Supabase project.
- Implement manager/admin `Availability Overview`.
- Continue the later scheduling write slices on top of the tracked schema.
