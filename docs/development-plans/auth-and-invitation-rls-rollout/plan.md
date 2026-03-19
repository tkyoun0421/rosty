# Auth And Invitation RLS Rollout

## Summary

Add the first repo-tracked RLS migration set for the current Supabase-backed auth, member management, and invitation workflows. This task enables `profiles` and `invitation_links` row-level security with minimal policies, moves self profile setup writes behind RPCs, and adds a limited invitation-status RPC for login and onboarding checks.

## Scope

- Add a migration that enables RLS for `profiles` and `invitation_links`.
- Add the minimum helper functions and policies needed for current app behavior: self profile read, active-admin profile read or write, and active-admin invitation read or write.
- Add a limited invitation-status RPC for login and profile-setup validation so employee onboarding does not require direct table access to `invitation_links`.
- Add a profile-setup RPC for non-invite onboarding so client-owned self writes do not need broad `profiles` update policies.
- Update the client invitation-status and profile-setup wrappers to use the new RPCs, then add focused tests.
- Update schema and product docs to describe the new RLS and RPC paths.

Out of scope:

- Full RLS rollout for every table in the schema document
- Applying the migrations to a real Supabase project in this turn
- Reworking manager access onto `member_directory`
- Server-enforced last-admin mutation guards beyond the existing client rules

## Implementation Steps

1. Lock the minimal auth and invitation RLS scope in docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add a Supabase migration for helper functions, `profiles` and `invitation_links` RLS policies, the profile-setup RPC, and the invitation-status RPC.
3. Switch the login or onboarding invitation lookup and non-employee profile setup write path to the new RPCs, then add focused tests for the wrappers.
4. Run lint or typecheck or unit tests, archive the plan, and update `WORKLOG.md` with the remaining rollout gaps.

## Data / Interface Impact

- New Supabase migration artifact under `supabase/migrations/`
- Updated profile-setup and invitation join lookups under `src/features/auth/api/` and `src/features/invitations/api/`
- Updated schema docs for RLS and function paths
- No route changes; `Login`, `Profile Setup`, `Members`, and `Invitation` keep the same UI flow

## Test Plan

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

Expected pass criteria:

- `profiles` and `invitation_links` have repo-tracked RLS policies for the current app flows.
- Admin invitation and member paths stay on direct table access under admin policies.
- Invite validation and self profile setup use limited RPCs instead of broad direct table access.
- The updated client wrappers and the new migration contract are covered by tests and docs.

Known gaps:

- The migrations still need manual apply and validation against the real Supabase project.
- The rest of the schema remains outside the first RLS rollout.
- Last-admin protection is still primarily enforced in the client and needs a later SQL guard.

## Done Criteria

- The repo contains a coherent first RLS migration set for current auth and invitation flows.
- Login or onboarding invite status no longer depends on direct `invitation_links` table reads, and self profile setup no longer depends on broad direct `profiles` writes.
- Docs, tests, and `WORKLOG.md` all reflect the new server access paths.
- The task ends with archived plan artifacts, commit, and push.