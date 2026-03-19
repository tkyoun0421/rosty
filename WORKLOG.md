# WORKLOG

## Current Task

Pending the next locked implementation or rollout task after completing the Supabase migration GitHub Actions rollout.

## Plan Doc

- Archive summary: `docs/development-plans/supabase-migration-github-actions/summary.md`
- Archive plan: `docs/development-plans/supabase-migration-github-actions/plan.md`

## Last Completed

Completed the Supabase migration GitHub Actions rollout task:

- Added `.github/workflows/supabase-migrations.yml` as a manual rollout workflow.
- Reused the repo-local Supabase migration scripts and GitHub secret injection instead of creating a separate CI rollout path.
- Added a dry-run or apply mode input and blocked real apply unless `confirm_apply=APPLY` is supplied.
- Updated the setup and secrets docs to list the workflow path and required GitHub secret names.
- Archived the completed feature plan into `docs/development-plans/supabase-migration-github-actions/` with `plan.md` and `summary.md`.

## Next Action

Populate `SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, and `SUPABASE_DB_PASSWORD` in GitHub secrets, run the `Supabase Migration Rollout` workflow with `mode=dry-run`, then repeat with `mode=apply` and `confirm_apply=APPLY`, and validate the real Supabase-backed auth, invitation, and admin flows. If rollout secrets still remain unavailable, lock the next unblocked implementation task before changing code.

## Blockers

- Real workflow rollout still depends on GitHub repository or environment secrets that are not configured from inside the repo.
- Real remote apply still needs manual dry-run review before the first apply.
- The rest of the schema is still outside the first RLS rollout.

## Latest Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual readback of `.github/workflows/supabase-migrations.yml`, `docs/product/setup.md`, and `docs/ops/secrets.md` after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Added the Supabase migration GitHub Actions workflow on 2026-03-19.
