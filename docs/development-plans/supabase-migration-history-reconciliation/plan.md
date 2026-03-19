# Supabase Migration History Reconciliation

## Summary

Reconcile the remote-only migration version `20260312121000` with the repo and add any missing bridging base-schema migration required so the tracked Supabase rollout chain can be applied safely to the real project.

## Scope

- Fetch or otherwise restore the remote-only migration history entry into the repo.
- Inspect the recovered migration content and compare it with the current app schema assumptions.
- Add a bridging base-schema migration if the fetched baseline does not satisfy the first tracked auth/invitation rollout migration.
- Rerun the real Supabase migration status, dry-run, and apply commands once the history and base schema are reconciled.
- Update `WORKLOG.md`, archive the completed notes, and finish with verification plus commit/push.

Out of scope:

- New product feature work
- Device QA for invitation or pay-policy flows
- Repairing remote migration history without first attempting a safe repo restore path
- Payroll calculation or manager payroll UI implementation

## Implementation Steps

1. Lock this plan and update `WORKLOG.md` before running reconciliation commands.
2. Use the repo-local Supabase CLI to fetch the remote-only migration history into `supabase/migrations/`.
3. Inspect the fetched migration content and compare it with the assumptions in `20260319190000_complete_employee_join.sql` and later rollout migrations.
4. Add a bridging base-schema migration before `20260319190000` if required, then rerun `pnpm supabase:migrations:status` and `pnpm supabase:migrations:dry-run`.
5. If the chain is clean, run `pnpm supabase:migrations:apply`; otherwise stop on the explicit blocker and document it.
6. Archive the task notes, refresh `WORKLOG.md`, and complete the task with verification plus commit/push.

## Data / Interface Impact

- `supabase/migrations/` history alignment with the remote project
- Base auth/invitation schema compatibility for the current app rollout chain
- Real Supabase migration state for the tracked rollout chain
- Rollout docs and `WORKLOG.md`

## Test Plan

- `pnpm supabase -- migration fetch`
- `pnpm supabase:migrations:status`
- `pnpm supabase:migrations:dry-run`
- `pnpm supabase:migrations:apply`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

Expected pass criteria:

- The remote-only migration version `20260312121000` is present locally after fetch.
- Status no longer reports `20260312121000` as remote-only.
- The base schema satisfies the preconditions for `20260319190000_complete_employee_join.sql`.
- Dry-run and apply either succeed or fail on a narrower explicit schema issue instead of history drift or missing base objects.

Known gaps:

- Real app flow validation still needs to happen after schema rollout succeeds.
- If the fetched baseline diverges heavily from the current app schema, additional migration review may still be needed before safe apply.

## Done Criteria

- The remote migration history mismatch is reconciled.
- The fetched baseline is either made compatible with the current tracked rollout chain or reduced to a narrower explicit blocker.
- Verification results and residual risk are captured in archived plan artifacts and `WORKLOG.md`.
- The repo ends the task with commit and push.
