# WORKLOG

## Current Task

Pending the next locked cross-cutting or staffing feature after completing the Global Search slice.

## Plan Doc

- Archive summary: `docs/development-plans/global-search-slice/summary.md`
- Archive plan: `docs/development-plans/global-search-slice/plan.md`

## Last Completed

Completed the Global Search slice:

- Added `src/app/search.tsx` and active-user access for the new search route.
- Added the search query/model/UI under `src/features/search/`.
- Added `supabase/migrations/20260320160000_member_directory_search_rpc.sql` for manager/admin member search.
- Added employee and manager/admin home entry points for the route.
- Reconfirmed the repo gate with lint, typecheck, unit tests, and export build verification.

## Next Action

Apply the shared scheduling/payroll migration plus the member-directory search migration to the real Supabase project, then lock the next cross-cutting or staffing feature.

## Blockers

- The shared scheduling/payroll read migration is repo-tracked but not yet applied to the real Supabase project, so assignments and payroll routes will still show the seeded fallback there.
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
- Completed the Global Search slice task on 2026-03-21.
