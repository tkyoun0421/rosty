# WORKLOG

## Current Task

Pending the next locked implementation or rollout task after completing the Supabase migration CLI rollout configuration.

## Plan Doc

- Archive summary: `docs/development-plans/supabase-migration-cli-rollout/summary.md`
- Archive plan: `docs/development-plans/supabase-migration-cli-rollout/plan.md`

## Last Completed

Completed the Supabase migration CLI rollout task:

- Added the `supabase` dev dependency and checked in `supabase/config.toml`, `supabase/.gitignore`, and `supabase/seed.sql`.
- Added repo-local CLI bootstrap and wrapper scripts for `supabase` version checks, migration link, status, dry-run, and apply flows.
- Added rollout env placeholders to `.env.example` and updated README, setup, and secrets docs for the new non-interactive migration path.
- Verified that `pnpm install` restores the local CLI binary and that missing rollout secrets now fail with an explicit prerequisite message.
- Archived the completed feature plan into `docs/development-plans/supabase-migration-cli-rollout/` with `plan.md` and `summary.md`.

## Next Action

Populate valid `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` values, run `pnpm supabase:migrations:dry-run`, then `pnpm supabase:migrations:apply`, and validate the auth, invitation, and admin flows against the real Supabase project. If rollout credentials remain unavailable, lock the next unblocked implementation task before changing code.

## Blockers

- Real Supabase apply still depends on valid privileged rollout credentials that are not stored in the repo.
- Remote schema drift, if any, still needs review before the first real `db push`.
- The rest of the schema is still outside the first RLS rollout.

## Latest Verification

- `pnpm install --frozen-lockfile`
- `pnpm supabase:install`
- `pnpm supabase -- --version`
- `ROSTY_SKIP_DOTENV=1` plus empty rollout vars with `pnpm supabase:migrations:status` to confirm explicit prerequisite failure
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of the new scripts, `supabase/config.toml`, `.env.example`, README, setup guide, and secrets guide after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Added the repo-local Supabase CLI rollout scripts and config on 2026-03-19.
