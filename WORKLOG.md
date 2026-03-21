# WORKLOG

## Current Task

Pending the next locked staffing or scheduling feature after completing the Assignment exception slice.

## Plan Doc

- Archive summary: `docs/development-plans/assignment-exception-slice/summary.md`
- Archive plan: `docs/development-plans/assignment-exception-slice/plan.md`

## Last Completed

Completed the Assignment exception slice:

- Extended assignment workspace save/read paths so `is_exception_case` is preserved.
- Added duplicate-assignee detection in the assignment workspace snapshot and explicit confirmation UI in `src/features/assignments/ui/assignment-workspace-screen.tsx`.
- Added focused API/model regression coverage and updated IA/worklog references for the richer staffing flow.
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
- Completed the Availability Collection toggle slice task on 2026-03-21.
