# Supabase Real Rollout Summary

## Goal

Attempt the first real Supabase rollout for the tracked auth, invitation, member-admin, and pay-policy migrations, or reduce the task to an explicit remote blocker with the repo-local rollout config fixed.

## Shipped

- Hardened `scripts/supabase-cli-utils.cjs` so example placeholder values such as `your-personal-access-token` are treated as unusable and `.env.local` can override placeholder entries left in `.env`.
- Hardened `scripts/run-supabase-migrations.cjs` so placeholder rollout secrets fail fast with explicit prerequisite errors before the Supabase CLI runs.
- Added `tests/supabase-migration-rollout.test.ts` to cover placeholder rejection, `.env.local` override behavior, and project-ref derivation.
- Updated `.env.example`, [README.md](../../../README.md), [setup.md](../../product/setup.md), and [secrets.md](../../ops/secrets.md) so rollout-only secrets are stored in `.env.local` or CI secret storage instead of shadowing tracked example values.
- Ran the real `pnpm supabase:migrations:status` and `pnpm supabase:migrations:dry-run` commands against project `pxxuhfagabdymdnclbfr`; both now link successfully and reveal the real remote blocker.

## Verification

- `pnpm supabase:migrations:status`
- `pnpm supabase:migrations:dry-run`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of the updated scripts, test file, `.env.example`, README, setup guide, and secrets guide after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.

Result: the local rollout tooling verification passed on 2026-03-19. The real dry-run reached the target Supabase project and stopped on the expected remote migration history mismatch instead of a local secret/config error.

## Residual Risk

- The remote project contains migration version `20260312121000`, but the repo does not contain a matching local migration file.
- `pnpm supabase:migrations:apply` is not safe until that remote-only migration history entry is reconciled.
- Live app validation for invitation and pay-policy flows is still pending after the schema rollout is unblocked.

## Follow-up

- Review what remote migration `20260312121000` represents and decide whether to restore that migration into the repo or repair the remote history after schema review.
- Once the migration history is reconciled, rerun `pnpm supabase:migrations:status`, `pnpm supabase:migrations:dry-run`, and `pnpm supabase:migrations:apply`.
- After apply succeeds, validate login, employee invite onboarding, admin members, and admin pay-policy flows against the real Supabase environment.
