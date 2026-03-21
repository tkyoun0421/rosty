# WORKLOG

## Current Task

Pending the real scheduling migration apply and the next locked staffing/scheduling follow-up after completing Schedule Create/Edit.

## Plan Doc

- Archive summary: `docs/development-plans/schedule-create-edit-slice/summary.md`
- Archive plan: `docs/development-plans/schedule-create-edit-slice/plan.md`

## Last Completed

Completed the Schedule Create/Edit slice:

- Added `src/app/schedule-edit.tsx` and manager/admin route access.
- Added the schedule edit form/model helpers and the save path under `src/features/schedules/`.
- Extended the local slot preset baseline and wired manager-home/schedule-detail entry points for the route.
- Reconfirmed the repo gate with lint, typecheck, unit tests, and export build verification.

## Next Action

Apply the shared scheduling/payroll migration plus the staffing/notifications migrations to the real Supabase project, then lock the next staffing/scheduling follow-up.

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
- Completed the Schedule Create/Edit slice task on 2026-03-21.
