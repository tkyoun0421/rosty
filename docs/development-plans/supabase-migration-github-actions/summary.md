# Supabase Migration GitHub Actions Rollout Summary

## Goal

Add a manual GitHub Actions rollout path so Supabase migrations can run from repository secrets when local privileged credentials are unavailable.

## Shipped

- Added `.github/workflows/supabase-migrations.yml` as a manual-only workflow.
- The workflow reuses the repo-local `pnpm supabase:migrations:*` scripts instead of creating a second rollout implementation.
- Added `mode` input for `dry-run` or `apply` and required `confirm_apply=APPLY` before the real apply step can run.
- Configured the workflow to consume `SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, and `SUPABASE_DB_PASSWORD` from GitHub secrets while forcing `ROSTY_SKIP_DOTENV=1`.
- Updated the setup and secrets docs to include the workflow trigger path and required secret names.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual readback of `.github/workflows/supabase-migrations.yml`, `docs/product/setup.md`, and `docs/ops/secrets.md` after PowerShell-based writes because `apply_patch` continued failing in the Windows sandbox refresh path.

Result: repo verification passed on 2026-03-19. The workflow structure and confirmation gate were checked by direct readback.

## Residual Risk

- The workflow still cannot execute a real rollout until the GitHub repository secrets are populated.
- Actual remote apply still needs a manual dry-run review before `mode=apply` should be used.
- The rest of the schema remains outside the first RLS rollout.

## Follow-up

- Add `SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, and `SUPABASE_DB_PASSWORD` to the GitHub repository or environment secrets.
- Run the `Supabase Migration Rollout` workflow with `mode=dry-run` first, then `mode=apply` with `confirm_apply=APPLY`.
- Validate auth, invitation, and admin flows against the real Supabase environment after the workflow apply succeeds.
