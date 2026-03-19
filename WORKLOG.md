# WORKLOG

## Current Task

Pending the next locked validation or feature task after completing the real Supabase migration rollout.

## Plan Doc

- Archive summary: `docs/development-plans/supabase-migration-history-reconciliation/summary.md`
- Archive plan: `docs/development-plans/supabase-migration-history-reconciliation/plan.md`

## Last Completed

Completed the Supabase migration history reconciliation task:

- Fetched the remote-only migration `20260312121000_init_rosty_schema.sql` into the repo.
- Added `20260319183000_auth_invitation_base_schema.sql` to bridge the fetched legacy baseline to the current auth/invitation base schema.
- Applied the remaining tracked migration chain to the real Supabase project, including the auth/invitation RLS rollout, last-admin SQL guard, member-admin RPC, and pay-policy rollout.
- Verified post-apply status alignment and an empty dry-run against the real project.

## Next Action

Validate login, employee invite onboarding, admin member actions, admin invitation actions, and admin pay-policy actions against the real Supabase project before locking the next feature task.

## Blockers

- Real app flow QA against the migrated Supabase project is still pending.
- The first admin account still depends on an out-of-band seed or manual promotion path.
- The fetched legacy single-hall tables remain in the remote project until a later cleanup task is explicitly locked.
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Latest Verification

- `pnpm supabase -- migration fetch`
- `pnpm supabase:migrations:status`
- `pnpm supabase:migrations:dry-run`
- `pnpm supabase:migrations:apply`
- Post-apply `pnpm supabase:migrations:status`
- Post-apply `pnpm supabase:migrations:dry-run`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of the fetched migration, bridging migration, archive summary, and `WORKLOG.md` after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Completed the real Supabase migration rollout on 2026-03-19.
