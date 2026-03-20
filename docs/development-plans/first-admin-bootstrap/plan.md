# First Admin Bootstrap

## Summary

Add a repo-tracked bootstrap path that promotes one existing Supabase auth user into the first persistent `admin` for the real Rosty project so app-level admin QA can proceed without ad hoc SQL.

## Scope

- Add a dedicated CLI script that links the configured Supabase project and runs a one-time first-admin bootstrap SQL path.
- Accept the bootstrap target by explicit user identifier input and reject ambiguous or placeholder configuration.
- Keep the bootstrap limited to the first persistent admin use case instead of broad multi-admin promotion tooling.
- Add focused regression coverage for the bootstrap script helpers and update the setup and schema docs.

Out of scope:

- Interactive browser or device QA after the admin exists
- General-purpose admin management outside the first-admin bootstrap flow
- Local auth user seeding for Supabase `db reset`
- Additional schedule, payroll, or legacy schema cleanup work

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the first-admin bootstrap work.
2. Implement a repo-tracked Supabase bootstrap command that validates rollout prerequisites, targets one existing auth user, and promotes that user to the first active admin in a safe, idempotent path.
3. Add focused tests for input validation and bootstrap SQL generation, then update setup and schema docs to describe the new command.
4. Re-run the repo verification commands, archive the task artifacts with a summary, and refresh `WORKLOG.md` with the result and next action.

## Data / Interface Impact

- New Supabase bootstrap script under `scripts/`
- New package script entry for the first-admin bootstrap command
- Focused regression coverage under `tests/`
- Updated onboarding and schema docs plus `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- The bootstrap script rejects missing, placeholder, or ambiguous inputs before any remote mutation.
- The generated bootstrap SQL is deterministic and limited to one existing auth user.
- The repo verification baseline still passes after the bootstrap tooling lands.

Known gaps:

- The actual remote bootstrap run still needs a real target auth user email or UUID.
- Interactive app-shell QA remains a separate follow-up once the persistent admin exists.

## Done Criteria

- The repo contains a documented first-admin bootstrap command for the linked Supabase project.
- The command is covered by focused tests and does not loosen the existing app permission model.
- `WORKLOG.md` reflects the completed bootstrap task, residual blockers, and next QA action.
