# WORKLOG

## Current Task

Maintain one canonical master plan and solve the remaining roadmap one item at a time from that document.

## Plan Doc

- Master plan: `docs/development-plan.md`

## Last Completed

Consolidated planning into one master plan:

- Added `docs/development-plan.md` as the single active roadmap.
- Reclassified `docs/development-plans/` as archive-only and removed the redundant active roadmap folder.
- Updated `WORKLOG.md` and development guidance to point at the single master plan.

## Next Action

Start the first `ready` item from `docs/development-plan.md` and keep updating that same file as work lands.

## Blockers

- The shared scheduling/payroll read migration is repo-tracked but not yet applied to the real Supabase project, so assignments and payroll routes will still show the seeded fallback there.
- The new settings migrations are also not yet applied to the real Supabase project, so live self profile updates and Settings deactivation cannot work there yet.
- The member-directory search migration is also not yet applied to the real Supabase project, so live manager/admin member search cannot work there yet.
- The new availability migration is also not yet applied to the real Supabase project, so the live employee availability RPC cannot work there yet.
- The new confirm-schedule migration is also not yet applied to the real Supabase project, so the live assignment workspace confirm RPC cannot work there yet.
- The new cancellation-request migration is also not yet applied to the real Supabase project, so the live employee cancellation RPC cannot work there yet.
- The new cancellation-review migration is also not yet applied to the real Supabase project, so the live manager/admin queue review RPC cannot work there yet.
- The new notifications migrations are also not yet applied to the real Supabase project, so the live inbox cannot receive the new cancellation, assignment-confirmed, schedule-created, or user-approved notifications there yet.
- The new schedule-completion migration is also not yet applied to the real Supabase project, so the live assigned-to-completed closeout path cannot work there yet.
- The new schedule-cancellation migration is also not yet applied to the real Supabase project, so the live collecting-or-assigned cancellation path cannot work there yet.
- Real Google OAuth still needs manual device or emulator confirmation on a dev build or standalone app.
- The real project still has no persistent admin account because this session does not yet have the intended target auth user email or UUID for the bootstrap command.
- The fetched legacy single-hall tables remain in the remote project until a later cleanup task is explicitly locked.
- Push delivery and device-token registration are still unimplemented.

## Latest Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- Consolidated the roadmap into `docs/development-plan.md` on 2026-03-25.
