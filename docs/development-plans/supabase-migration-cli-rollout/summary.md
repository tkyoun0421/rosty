# Supabase Migration CLI Rollout Summary

## Goal

Add a repo-local Supabase CLI rollout path so the existing migration files can be linked to a real Supabase project and applied through repeatable non-interactive commands.

## Shipped

- Added the `supabase` CLI as a repo dev dependency and checked in `supabase/config.toml`, `supabase/.gitignore`, and an empty `supabase/seed.sql` baseline.
- Added a root `postinstall` bootstrap so `pnpm install` restores the local Supabase CLI binary even when pnpm skips dependency build scripts.
- Added `scripts/install-supabase-cli.cjs`, `scripts/run-supabase.cjs`, `scripts/run-supabase-migrations.cjs`, and `scripts/supabase-cli-utils.cjs`.
- Added `pnpm supabase`, `pnpm supabase:install`, `pnpm supabase:migrations:link`, `pnpm supabase:migrations:status`, `pnpm supabase:migrations:dry-run`, and `pnpm supabase:migrations:apply`.
- Added rollout env placeholders to `.env.example` and updated the setup, README, and secrets docs for the new migration path.
- The migration wrapper now fails with explicit prerequisite messages when rollout secrets are missing instead of falling through to opaque shell or CLI errors.

## Verification

- `pnpm install --frozen-lockfile`
- `pnpm supabase:install`
- `pnpm supabase -- --version`
- `ROSTY_SKIP_DOTENV=1` plus empty rollout vars with `pnpm supabase:migrations:status` to confirm explicit prerequisite failure
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of the new scripts, `supabase/config.toml`, `.env.example`, README, setup guide, and secrets guide after PowerShell-based writes because `apply_patch` continued failing in the Windows sandbox refresh path.

Result: the install bootstrap, local CLI wrapper, and repo verification all passed on 2026-03-19. The missing-secret migration status check failed intentionally with the expected prerequisite message.

## Residual Risk

- Real migration apply still depends on valid `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` values outside the repo.
- Remote schema drift still needs review before `pnpm supabase:migrations:apply`.
- pnpm still prints its ignored-build-scripts warning, but the repo root `postinstall` now bootstraps the Supabase CLI binary successfully.

## Follow-up

- Fill `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` locally or in CI secret storage.
- Run `pnpm supabase:migrations:dry-run`, then `pnpm supabase:migrations:apply` against the target project.
- Validate login, employee invite onboarding, admin members, and admin invitation flows against the real Supabase environment after apply.
