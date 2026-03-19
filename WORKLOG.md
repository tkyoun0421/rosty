# WORKLOG

## Current Task

Pending the next locked implementation or rollout task after completing the first auth and invitation RLS rollout.

## Plan Doc

- Archive summary: `docs/development-plans/auth-and-invitation-rls-rollout/summary.md`
- Archive plan: `docs/development-plans/auth-and-invitation-rls-rollout/plan.md`

## Last Completed

Completed the auth and invitation RLS rollout task:

- Added the first repo-tracked `profiles` and `invitation_links` RLS migration set.
- Added `is_active_admin()`, `complete_profile_setup(...)`, and `get_employee_invitation_status(...)` SQL functions.
- Switched login or onboarding invite validation to the limited invitation-status RPC.
- Switched non-invite profile setup to the limited profile-setup RPC instead of broad direct `profiles` writes.
- Updated the PRD and Supabase schema docs for the new RLS and RPC access paths.
- Added Jest coverage for the new invitation-status and profile-setup RPC wrappers.
- Archived the completed feature plan into `docs/development-plans/auth-and-invitation-rls-rollout/` with `plan.md` and `summary.md`.

## Next Action

Apply `supabase/migrations/20260319190000_complete_employee_join.sql` and `supabase/migrations/20260319193000_auth_and_invitation_rls.sql` to the real Supabase project, then validate login, employee invite onboarding, admin members, and admin invitation flows end to end.

## Blockers

- The real Supabase project still needs both repo-tracked auth and invitation migrations applied before the new server access paths can succeed.
- The rest of the schema is still outside the first RLS rollout.
- Last-admin protection still needs a later SQL guard.

## Latest Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual readback of the archived plan, summary, `WORKLOG.md`, migration files, and edited auth or invitation files after shell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Added `supabase/migrations/20260319193000_auth_and_invitation_rls.sql` on 2026-03-19.