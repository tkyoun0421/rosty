# Auth And Invitation RLS Rollout Summary

## Goal

Add the first repo-tracked RLS migration set for the auth, members, and invitation features that already exist in the app, while replacing broad self-service table access with limited RPC paths.

## Shipped

- Added `supabase/migrations/20260319193000_auth_and_invitation_rls.sql` with the first `profiles` and `invitation_links` RLS policies used by the current app.
- Added `is_active_admin()` for admin-gated table policies.
- Added `complete_profile_setup(...)` so non-invite onboarding no longer depends on broad direct writes to `profiles`.
- Added `get_employee_invitation_status(...)` so login and onboarding invite validation no longer depends on direct reads from `invitation_links`.
- Switched the client invitation join lookup and non-invite profile setup wrapper to the new RPCs.
- Added Jest coverage for the invitation-status RPC wrapper and the profile-setup RPC wrapper.
- Updated the PRD and Supabase schema docs to describe the new server access paths.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- Both new migrations still need to be applied to the real Supabase project before the RLS and RPC paths become active.
- The rest of the schema is still outside the first RLS rollout.
- Last-admin protection is still primarily enforced in the client and needs a later SQL guard.

## Follow-up

- Apply `20260319190000_complete_employee_join.sql` and `20260319193000_auth_and_invitation_rls.sql` to the target Supabase environment.
- Validate login, employee invite onboarding, admin members, and admin invitation flows end to end against the real project.
- Continue the repo-tracked RLS rollout for the remaining schema tables.