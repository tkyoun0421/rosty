# WORKLOG

## Current Task

Pending the next locked implementation or rollout task after completing the employee join transactional RPC.

## Plan Doc

- Archive summary: `docs/development-plans/employee-join-transactional-rpc/summary.md`
- Archive plan: `docs/development-plans/employee-join-transactional-rpc/plan.md`

## Last Completed

Completed the employee join transactional RPC task:

- Added a Supabase migration artifact for `complete_employee_join` so employee onboarding can validate the invite, upsert `profiles`, and consume the invite in one transaction.
- Replaced the client-side invitation claim and rollback flow with a single RPC wrapper during employee `Profile Setup`.
- Kept non-employee profile setup on the existing direct `profiles` upsert path.
- Locked the transactional onboarding rule in the PRD, state tables, and Supabase schema docs.
- Added unit coverage for the employee join RPC wrapper.
- Archived the completed feature plan into `docs/development-plans/employee-join-transactional-rpc/` with `plan.md` and `summary.md`.

## Next Action

Apply `supabase/migrations/20260319190000_complete_employee_join.sql` to the real Supabase project and validate employee invite onboarding end to end before taking the next auth or invitation feature.

## Blockers

- The real Supabase project still needs the new `complete_employee_join` migration applied before employee profile setup can succeed.
- Broader repo-tracked RLS rollout for the rest of the schema is still incomplete.

## Latest Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual readback of the archived plan, summary, `WORKLOG.md`, and edited auth or invitation files after shell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Added `supabase/migrations/20260319190000_complete_employee_join.sql` on 2026-03-19.