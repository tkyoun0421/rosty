# WORKLOG

## Current Task

Pending the next locked staffing or scheduling feature after completing the Schedule list filter slice.

## Plan Doc

- Archive summary: `docs/development-plans/schedule-list-filter-slice/summary.md`
- Archive plan: `docs/development-plans/schedule-list-filter-slice/plan.md`

## Last Completed

Completed the Schedule list filter slice:

- Added schedule list filter helpers for `all / collecting / assigned / closed` and `all / open / locked`.
- Updated `src/features/schedules/ui/schedule-list-screen.tsx` with top tabs, chips, and filtered empty states.
- Updated worklog archive references for the richer schedule browsing flow.
- Reconfirmed the repo gate with lint, typecheck, unit tests, and export build verification.

## Next Action

Apply the shared scheduling/payroll migration to the real Supabase project, then lock the next staffing or scheduling slice.

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
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Latest Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- Completed the Schedule list filter slice task on 2026-03-23.
