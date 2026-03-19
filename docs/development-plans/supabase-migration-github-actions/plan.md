# Supabase Migration GitHub Actions Rollout

## Summary

Add a manual GitHub Actions workflow that runs the repo-local Supabase migration scripts with injected repository secrets so dry-run and apply can execute without depending on a developer machine.

## Scope

- Add a workflow under `.github/workflows/` for manual Supabase migration rollout.
- Reuse the repo-local `pnpm supabase:migrations:*` scripts instead of introducing a second rollout path.
- Require explicit workflow input before a real apply step runs.
- Update docs to list the required GitHub Actions secret names and the manual trigger path.

Out of scope:

- Storing real rollout secrets in the repo
- Automatically applying migrations on every push or merge
- Adding new SQL migrations beyond the current rollout set
- Validating the workflow against a real Supabase project in this turn

## Implementation Steps

1. Lock the workflow rollout scope in docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add a manual GitHub Actions workflow that installs dependencies, bootstraps the local CLI, checks migration status, and supports dry-run or apply.
3. Update setup and secrets docs for the workflow secret contract and trigger flow.
4. Run repo verification, archive the plan, and update `WORKLOG.md` with the remaining credential dependency.

## Data / Interface Impact

- New workflow file under `.github/workflows/`
- Updated setup and secret-handling docs
- No mobile app runtime changes

## Test Plan

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual readback of the workflow YAML and updated docs

Expected pass criteria:

- The workflow uses the repo-local migration scripts instead of duplicating rollout logic.
- The apply path requires an explicit confirmation input.
- Required GitHub Actions secret names are documented.

Known gaps:

- Real workflow execution still depends on configured GitHub repository secrets.
- Real remote apply still needs a manual dry-run review before production use.
- The rest of the schema remains outside the first RLS rollout.

## Done Criteria

- A repo-tracked manual migration workflow exists.
- Docs and `WORKLOG.md` reflect the new GitHub Actions rollout path.
- Verification stays green and the task ends with archived plan artifacts, commit, and push.
