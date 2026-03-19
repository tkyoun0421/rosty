# Supabase Migration History Reconciliation Summary

## Goal

Reconcile the remote-only migration history entry `20260312121000` with the repo, bridge the fetched legacy baseline to the current auth/invitation schema, and complete the first real Supabase migration rollout.

## Shipped

- Fetched `supabase/migrations/20260312121000_init_rosty_schema.sql` from the remote migration history so local and remote migration chains align.
- Added `supabase/migrations/20260319183000_auth_invitation_base_schema.sql` to bridge the fetched legacy baseline to the current auth/invitation base schema.
- The bridging migration upgrades the baseline `user_role` path to the current app role set, adds `user_status` and `profile_gender`, expands `profiles` to the current contract, creates `invitation_links`, updates `handle_new_user()`, and removes the legacy direct `profiles` policies that would conflict with the later RLS rollout.
- Applied the full pending migration chain to the real Supabase project `pxxuhfagabdymdnclbfr`:
  - `20260319183000_auth_invitation_base_schema.sql`
  - `20260319190000_complete_employee_join.sql`
  - `20260319193000_auth_and_invitation_rls.sql`
  - `20260319194500_last_active_admin_guard.sql`
  - `20260319203000_member_admin_rpc.sql`
  - `20260319214500_pay_policy_admin_rollout.sql`

## Verification

- `pnpm supabase -- migration fetch`
- `pnpm supabase:migrations:status`
- `pnpm supabase:migrations:dry-run`
- `pnpm supabase:migrations:apply`
- Post-apply `pnpm supabase:migrations:status`
- Post-apply `pnpm supabase:migrations:dry-run`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of the fetched migration, bridging migration, updated plan, and `WORKLOG.md` after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.

Result: all tracked migrations are now applied to the real Supabase project and post-apply dry-run reports the remote database is up to date.

## Residual Risk

- The fetched legacy baseline still leaves old single-hall tables such as `halls`, `memberships`, and `shifts` in the remote project even though the current app no longer uses them.
- Real app flow QA is still pending for login, employee invite onboarding, admin member management, admin invitation management, and admin pay-policy management against the now-migrated project.
- The first admin account still depends on out-of-band seed or manual promotion because the tracked rollout does not create one automatically.

## Follow-up

- Validate login, employee invite onboarding, admin member actions, admin invitation actions, and admin pay-policy actions against the real Supabase project.
- Decide whether the fetched legacy single-hall tables should be retained temporarily or cleaned up in a later schema task after app validation is complete.
- Lock the next payroll-facing or runtime-validation task once the real migrated environment is confirmed healthy.
