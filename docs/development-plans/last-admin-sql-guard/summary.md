# Last Admin SQL Guard Summary

## Goal

Add a repo-tracked SQL safeguard so direct `profiles` updates cannot remove active admin access from the final active admin account.

## Shipped

- Added `supabase/migrations/20260319194500_last_active_admin_guard.sql`.
- Added `public.enforce_last_active_admin_guard()` and the `profiles_last_active_admin_guard` trigger on `public.profiles`.
- Serialized last-admin downgrade checks with `pg_advisory_xact_lock(...)` so concurrent admin updates cannot bypass the guard.
- Kept the existing client-side member guard in place as UX feedback while the database now enforces the same invariant for direct table writes.
- Updated the Supabase schema notes so the `profiles` constraints document the repo-tracked SQL trigger.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of the new migration, updated schema doc, and archived task files after PowerShell-based writes because `apply_patch` continued failing in the Windows sandbox refresh path.

Result: all passed on 2026-03-19.

## Residual Risk

- The new migration still needs to be applied to the real Supabase project before the last-admin guard is active there.
- The current member admin mutation path still writes `profiles` directly; broader server action wrappers remain a separate follow-up.
- The rest of the schema is still outside the first RLS rollout.

## Follow-up

- Apply `20260319190000_complete_employee_join.sql`, `20260319193000_auth_and_invitation_rls.sql`, and `20260319194500_last_active_admin_guard.sql` to the target Supabase environment.
- Validate admin member suspend and role-change flows against the real project, including the last-admin rejection path.
- Continue the repo-tracked RLS rollout for the remaining schema tables.
