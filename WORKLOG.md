# WORKLOG

## Current Task

Pending the next locked implementation or rollout task after completing the member admin RPC rollout.

## Plan Doc

- Archive summary: `docs/development-plans/member-admin-rpc-rollout/summary.md`
- Archive plan: `docs/development-plans/member-admin-rpc-rollout/plan.md`

## Last Completed

Completed the member admin RPC rollout task:

- Added `supabase/migrations/20260319203000_member_admin_rpc.sql`.
- Added `public.admin_manage_member(...)` for the current admin member actions and removed the tracked broad `profiles_admin_update` policy.
- Added the `manageMemberAccount` client RPC wrapper and switched `use-member-admin-mutation.ts` off direct `profiles` updates.
- Added focused Jest coverage for the new member admin RPC wrapper.
- Updated the Supabase schema notes and archived the completed feature plan into `docs/development-plans/member-admin-rpc-rollout/` with `plan.md` and `summary.md`.

## Next Action

Apply the pending auth and member admin migrations to the real Supabase project, then validate admin member actions end to end. If rollout credentials remain unavailable, lock the next unblocked implementation task before changing code.

## Blockers

- The new member-admin RPC still depends on the tracked migrations being applied to the real Supabase project.
- GitHub or local rollout secrets remain required for the first real migration apply.
- The rest of the schema is still outside the first RLS rollout.

## Latest Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- Manual UTF-8 readback of `supabase/migrations/20260319203000_member_admin_rpc.sql`, the new member admin RPC wrapper and test, `src/features/members/api/use-member-admin-mutation.ts`, and `docs/product/supabase-schema.md` after PowerShell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Added the member admin RPC rollout on 2026-03-19.
