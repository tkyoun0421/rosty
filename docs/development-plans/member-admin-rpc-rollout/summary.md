# Member Admin RPC Rollout Summary

## Goal

Move the admin member mutation flow from direct `profiles` updates to a limited Supabase RPC so approval, suspend, reactivate, and role-change actions no longer depend on broad admin update access on `profiles`.

## Shipped

- Added `supabase/migrations/20260319203000_member_admin_rpc.sql`.
- Added `public.admin_manage_member(...)` for the current admin member actions: approve, suspend, reactivate, and change-role.
- Removed the tracked `profiles_admin_update` policy so admin member writes now flow through the limited RPC path instead of broad direct table updates.
- Added `src/features/members/api/manage-member-account.ts` and Jest coverage in `src/features/members/api/manage-member-account.test.ts`.
- Switched `use-member-admin-mutation.ts` to the new RPC wrapper and reused the shared `membersQueryKey` export.
- Updated the Supabase schema notes so the `profiles` access path and RLS matrix document the limited RPC requirement.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of the new migration, member admin wrapper, mutation hook, and updated schema notes after PowerShell-based writes because `apply_patch` continued failing in the Windows sandbox refresh path.

Result: all passed on 2026-03-19.

## Residual Risk

- The new migration still needs to be applied to the real Supabase project before the RPC path is live there.
- Applying the migration before the updated client is deployed would temporarily break admin member writes because the broad direct update policy is removed in favor of the RPC path.
- The rest of the schema remains outside the first RLS rollout.

## Follow-up

- Apply `20260319193000_auth_and_invitation_rls.sql`, `20260319194500_last_active_admin_guard.sql`, and `20260319203000_member_admin_rpc.sql` to the target Supabase project in sequence.
- Validate admin approve, suspend, reactivate, and role-change flows against the real Supabase project.
- Continue the repo-tracked RLS rollout for the remaining schema tables.
