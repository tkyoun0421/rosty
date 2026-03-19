# Supabase Migration CLI Rollout

## Summary

Add a repo-local Supabase CLI execution path so the existing migration files can be linked to a real Supabase project and applied through repeatable non-interactive commands instead of ad hoc local setup.

## Scope

- Add the repo configuration required for Supabase CLI usage under `supabase/`.
- Add package scripts or Node wrappers for `link`, migration status checks, dry-run, and migration apply.
- Add non-public environment variable placeholders to `.env.example` without committing secrets.
- Update setup and ops docs so migration rollout prerequisites and commands are explicit.

Out of scope:

- Applying migrations to a real Supabase project in this turn
- Committing real tokens, DB passwords, or project-private identifiers
- Adding broader schema migrations unrelated to rollout configuration
- Replacing the current migration files or changing app runtime Supabase client behavior

## Implementation Steps

1. Lock the rollout tooling scope in docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add repo-local Supabase CLI support and scripts for link, status, dry-run, and apply flows.
3. Update `.env.example`, setup docs, and secrets guidance for the new rollout path.
4. Run verification for the repo and the new CLI wrapper path, archive the plan, and update `WORKLOG.md`.

## Data / Interface Impact

- New repo-tracked Supabase CLI config under `supabase/`
- New package scripts and/or Node wrappers under `scripts/`
- Updated setup and secret-handling documentation
- No user-facing app UI changes

## Test Plan

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm supabase -- --version`
- Run the new migration helper in a no-secret environment and confirm it fails with an explicit prerequisite message instead of a vague shell error.

Expected pass criteria:

- The repo can invoke a local Supabase CLI through a checked-in script path.
- Migration rollout prerequisites are explicit and do not require editing tracked files by hand.
- Missing rollout secrets produce actionable errors.

Known gaps:

- Real migration apply still depends on valid Supabase credentials and project access.
- Remote schema drift, if any, still needs manual review before `db push`.
- The rest of the schema remains outside the first RLS rollout.

## Done Criteria

- Supabase migration execution is repo-configured and documented.
- `WORKLOG.md` points to the new archived rollout summary.
- Verification stays green and the task ends with archived plan artifacts, commit, and push.
