# WORKLOG

## Current Task

Pending the next locked cross-cutting or staffing feature after completing the Settings slice.

## Plan Doc

- Archive summary: `docs/development-plans/settings-slice/summary.md`
- Archive plan: `docs/development-plans/settings-slice/plan.md`

## Last Completed

Completed the Settings slice:

- Added `src/app/settings.tsx` and active-user access for the new settings route.
- Added the settings query/mutation/model/UI under `src/features/settings/`.
- Added `supabase/migrations/20260321103000_update_my_profile_rpc.sql` for the limited self profile-update path.
- Added employee and manager/admin home entry points for the route.
- Reconfirmed the repo gate with lint, typecheck, unit tests, and export build verification.

## Next Action

Apply the new settings migration plus the shared scheduling/payroll migration to the real Supabase project, then lock the next cross-cutting or staffing feature.

## Blockers

- The shared scheduling/payroll read migration is repo-tracked but not yet applied to the real Supabase project, so assignments and payroll routes will still show the seeded fallback there.
- The new settings migration is also not yet applied to the real Supabase project, so live self profile updates cannot work there yet.
- The member-directory search migration is also not yet applied to the real Supabase project, so live manager/admin member search cannot work there yet.
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
- Completed the Settings slice task on 2026-03-21.
