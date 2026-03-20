# WORKLOG

## Current Task

Pending the real scheduling migration apply and the next locked staffing/scheduling follow-up after completing the first Assignment Workspace slice.

## Plan Doc

- Archive summary: `docs/development-plans/assignment-workspace-slice/summary.md`
- Archive plan: `docs/development-plans/assignment-workspace-slice/plan.md`

## Last Completed

Completed the Assignment Workspace slice:

- Added `src/app/assignment-workspace.tsx` and manager/admin route access.
- Added the workspace query, fallback state, draft save/clear, and confirm helpers under `src/features/assignments/`.
- Added `supabase/migrations/20260320153000_confirm_schedule_assignments_rpc.sql` for the limited confirm write path.
- Updated `Schedule Detail` and `Availability Overview` so manager/admin users can open the workspace from the current schedule flow.
- Reconfirmed the repo gate with lint, typecheck, unit tests, and export build verification.

## Next Action

Apply the shared scheduling/payroll migration plus the staffing/notifications migrations to the real Supabase project, then lock `Work Time` or the next scheduling write slice.

## Blockers

- The shared scheduling/payroll read migration is repo-tracked but not yet applied to the real Supabase project, so assignments and payroll routes will still show the seeded fallback there.
- The new availability migration is also not yet applied to the real Supabase project, so the live employee availability RPC cannot work there yet.
- The new confirm-schedule migration is also not yet applied to the real Supabase project, so the live assignment workspace confirm RPC cannot work there yet.
- The new cancellation-request migration is also not yet applied to the real Supabase project, so the live employee cancellation RPC cannot work there yet.
- The new cancellation-review migration is also not yet applied to the real Supabase project, so the live manager/admin queue review RPC cannot work there yet.
- The new notifications migration is also not yet applied to the real Supabase project, so the live inbox cannot receive the new cancellation notifications there yet.
- Real Google OAuth still needs manual device or emulator confirmation on a dev build or standalone app.
- The real project still has no persistent admin account because this session does not yet have the intended target auth user email or UUID for the bootstrap command.
- The fetched legacy single-hall tables remain in the remote project until a later cleanup task is explicitly locked.
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Latest Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- Completed the Assignment Workspace slice task on 2026-03-20.
