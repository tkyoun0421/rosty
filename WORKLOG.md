# WORKLOG

## Current Task

Implement the `Members Backend Hardening` bulk-RPC hardening step from the single master plan.

## Plan Doc

- Master plan: `docs/development-plan.md`

## Last Completed

Completed the `Members Backend Hardening` batch-RPC slice:

- Added `admin_manage_members_bulk(...)` as the limited server path for bulk member actions.
- Updated the members admin client and `Members` bulk action UI to use the new batch RPC instead of client-side sequential network loops.
- Updated the master plan and schema doc so the hardening lane reflects the shipped state.

## Next Action

Lock the next `ready` item from `docs/development-plan.md`, starting with `Members Admin 추가 폴리시`.

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
- Completed the members batch-RPC hardening slice on 2026-03-25.
