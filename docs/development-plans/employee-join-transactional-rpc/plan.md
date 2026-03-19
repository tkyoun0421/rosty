# Employee Join Transactional RPC

## Summary

Replace the client-driven employee join completion flow with a server-enforced RPC that atomically validates the invitation, upserts the employee profile, and consumes the invitation link in one database transaction.

## Scope

- Add a Supabase migration artifact for an authenticated employee-join RPC.
- Route employee `Profile Setup` submission through the new RPC instead of separate invitation and profile writes.
- Keep non-employee profile setup on the existing direct `profiles` upsert path.
- Add focused tests for the new client RPC wrapper and update product or schema docs to reflect the server-enforced join path.

Out of scope:

- Full RLS policy rollout for `profiles` and `invitation_links`
- Device-level QA for invite sharing or join deep links
- Admin invite issue or reissue transactional guarantees
- Broader auth or session refactors beyond employee profile setup

## Implementation Steps

1. Lock the transactional employee join scope in docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add a migration file for a security-definer RPC that validates the invite, upserts the employee profile, and consumes the invitation in a short transaction.
3. Add a typed client wrapper for the RPC and switch employee profile setup to use it while keeping manager or admin profile setup on the current path.
4. Add tests, run lint or typecheck or unit tests, then archive the plan and update `WORKLOG.md` with the remaining rollout risk.

## Data / Interface Impact

- New SQL migration artifact under `supabase/migrations/`
- Updated auth onboarding mutation in `src/features/auth/api/`
- Updated schema or product docs for the server-enforced employee join path
- No new route or screen; `Login` and `Profile Setup` keep the same UI entry points

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Employee profile setup calls one RPC that owns invite validation, profile upsert, and invite consumption.
- Invalid or already used invite tokens still fail with a clear message.
- Non-employee profile setup still uses the existing `profiles` upsert path.
- The repo includes a migration artifact that can be applied to Supabase without hand-editing production state.

Known gaps:

- The repo still does not apply the migration automatically; Supabase rollout remains a manual follow-up.
- Full RLS and grant coverage for the rest of the schema is still outside this task.
- Device QA is still needed to confirm the end-to-end join path against a real Supabase project.

## Done Criteria

- Employee join completion no longer depends on client-side sequential writes or best-effort rollback.
- The migration artifact and client code agree on the RPC contract.
- Tests cover the RPC wrapper and existing auth verification remains green.
- The task ends with updated docs, archived plan, `WORKLOG.md`, commit, and push.