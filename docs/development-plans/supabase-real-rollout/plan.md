# Supabase Real Rollout

## Summary

Attempt the pending auth, invitation, member-admin, and pay-policy migration rollout against the real Supabase project. If local rollout is blocked by placeholder or missing secrets, harden the repo-local migration config so placeholder values fail fast and `.env.local` or process-level secrets can override tracked examples cleanly.

## Scope

- Run the repo-local Supabase migration dry-run against the configured project.
- Diagnose rollout blockers if the dry-run fails before the remote apply step.
- Harden the rollout loader and prerequisite validation when placeholder secret values block the real migration path.
- Verify the resulting migration command behavior and capture the rollout result in repo docs.
- Update `WORKLOG.md`, archive the completed notes, and finish with commit/push.

Out of scope:

- New schema or client feature work
- Device QA for admin invitation or pay-policy screens
- Broader payroll calculation or manager payroll UI implementation
- Any direct production data writes outside the tracked migration apply flow

## Implementation Steps

1. Lock this plan and update `WORKLOG.md` before running rollout commands.
2. Run `pnpm supabase:migrations:dry-run` and inspect the pending migration set.
3. If the dry-run is clean, run `pnpm supabase:migrations:apply` and verify the resulting migration status.
4. If rollout is blocked by placeholder or missing secrets, update the local env loader and migration prerequisite checks so placeholder examples do not shadow real secrets.
5. Add focused tests, archive the rollout notes, refresh `WORKLOG.md`, and complete the task with verification plus commit/push.

## Data / Interface Impact

- Real Supabase schema state for the tracked migration chain when valid secrets are present
- Repo rollout scripts under `scripts/`
- Setup and secrets guidance for local and CI rollout secrets
- `WORKLOG.md` recovery pointer and latest verification state

## Test Plan

- `pnpm supabase:migrations:dry-run`
- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`

Expected pass criteria:

- The configured project links successfully through the repo-local Supabase CLI wrapper when valid secrets are present.
- Placeholder rollout secrets are rejected before the Supabase CLI runs.
- `.env.local` or process env can override placeholder values from `.env`.

Known gaps:

- This task validates rollout configuration and schema apply behavior, not app device flows.
- Real apply still requires a non-placeholder `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` outside tracked files.

## Done Criteria

- The real rollout either completes or is reduced to an explicit external-secret blocker with the repo-local config fixed.
- The rollout result and residual risks are captured in archived plan artifacts and `WORKLOG.md`.
- The repo contains the necessary script, doc, and test updates for this rollout task and ends with commit/push.
