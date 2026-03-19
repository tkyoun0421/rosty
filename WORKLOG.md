# WORKLOG

## Current Task

Pending the next locked implementation or rollout task after completing the server-enforced last-admin SQL guard.

## Plan Doc

- Archive summary: `docs/development-plans/last-admin-sql-guard/summary.md`
- Archive plan: `docs/development-plans/last-admin-sql-guard/plan.md`

## Last Completed

Completed the last-admin SQL guard task:

- Added `supabase/migrations/20260319194500_last_active_admin_guard.sql`.
- Added `public.enforce_last_active_admin_guard()` and the `profiles_last_active_admin_guard` trigger on `public.profiles`.
- Serialized last-admin downgrade checks with `pg_advisory_xact_lock(...)` so concurrent updates cannot remove the final active admin.
- Updated the Supabase schema notes to record that `profiles` now has a repo-tracked SQL guard for the last active admin.
- Archived the completed feature plan into `docs/development-plans/last-admin-sql-guard/` with `plan.md` and `summary.md`.

## Next Action

Apply `supabase/migrations/20260319190000_complete_employee_join.sql`, `supabase/migrations/20260319193000_auth_and_invitation_rls.sql`, and `supabase/migrations/20260319194500_last_active_admin_guard.sql` to the real Supabase project, then validate login, employee invite onboarding, admin members, and admin invitation flows end to end. If rollout access is still unavailable, lock the next unblocked implementation task before changing code.

## Blockers

- The real Supabase project still needs all three repo-tracked auth and invitation migrations applied before the current server access paths and last-admin SQL guard can succeed in practice.
- No repo-local Supabase CLI configuration or privileged rollout credential is available yet for real environment apply or validation.
- The rest of the schema is still outside the first RLS rollout.

## Latest Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of `supabase/migrations/20260319194500_last_active_admin_guard.sql`, `docs/product/supabase-schema.md`, the archived plan, and the archived summary after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Added `supabase/migrations/20260319194500_last_active_admin_guard.sql` on 2026-03-19.
