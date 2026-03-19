# Member Admin RPC Rollout

## Summary

Move the admin member mutation flow from direct `profiles` updates to a limited Supabase RPC so approval, suspend, reactivate, and role-change actions no longer depend on broad admin update access on `profiles`.

## Scope

- Add a Supabase migration for a limited admin member-management RPC.
- Switch the client member admin mutation hook to the RPC wrapper.
- Add focused Jest coverage for the new member admin RPC wrapper.
- Update schema docs so `profiles` access notes match the new limited RPC path.

Out of scope:

- Real Supabase apply or live workflow execution in this turn
- New admin actions beyond approve, suspend, reactivate, and role change
- Deactivated-account management
- Member read-path refactors or broader admin-area feature work

## Implementation Steps

1. Lock the member admin RPC scope in docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add a migration for the limited admin member-management RPC and tighten `profiles` update access to the RPC path.
3. Add the client RPC wrapper, switch the mutation hook, and add focused tests.
4. Update schema docs, run verification, archive the plan, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New Supabase migration artifact under `supabase/migrations/`
- New member admin RPC wrapper under `src/features/members/api/`
- Updated `Members` mutation implementation
- Updated Supabase schema notes for `profiles`

## Test Plan

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

Expected pass criteria:

- Member admin mutations no longer call direct `profiles` updates from the client.
- The new RPC wrapper is covered by unit tests.
- The schema docs reflect that admin member writes now flow through a limited RPC instead of broad table update access.

Known gaps:

- The new migration still needs to be applied to the real Supabase project before the RPC path is live there.
- The first real rollout still depends on the GitHub Actions or local secret-based migration path.
- The rest of the schema remains outside the first RLS rollout.

## Done Criteria

- Member admin writes are repo-switched to a limited RPC path.
- `profiles` broad admin update access is removed from the tracked RLS policy set.
- Verification stays green and the task ends with archived plan artifacts, commit, and push.
