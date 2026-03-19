# Last Admin SQL Guard

## Summary

Add server-enforced protection for the last active admin so direct `profiles` updates cannot suspend, deactivate, or downgrade the final active admin account even when a client bypasses the current UI guard.

## Scope

- Add a Supabase migration artifact that blocks `profiles` updates which would reduce active admin count to zero.
- Keep the current client-side last-admin checks in place as UX guardrails.
- Update schema docs to reflect that the last-admin rule now has a database guard.

Out of scope:

- Delete-path protection for tables that do not currently expose delete flows
- Full rollout or apply of the new migration to a real Supabase project in this turn
- Refactoring member-management UI or mutation shape
- Broader SQL enforcement for unrelated admin workflows

## Implementation Steps

1. Lock the last-admin SQL guard scope in docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add a migration that installs a `profiles` trigger or equivalent function to reject updates that would remove the final active admin.
3. Update schema docs to mention the server-enforced guard and keep client behavior aligned.
4. Run typecheck or lint or unit tests, archive the plan, and update `WORKLOG.md` with the remaining rollout dependency.

## Data / Interface Impact

- New Supabase migration artifact under `supabase/migrations/`
- Updated schema docs for `profiles` constraints
- No route or UI changes expected unless verification reveals an error-message mismatch

## Test Plan

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

Expected pass criteria:

- The repo contains a migration artifact that blocks updates which would remove the last active admin.
- Current admin member mutations remain compatible with the new server rule.
- Docs clearly state that the last-admin rule is now enforced in SQL as well as the client.

Known gaps:

- The migration still needs to be applied to the real Supabase project before the rule is active there.
- The rest of the schema remains outside the first RLS rollout.
- The app still relies on direct admin `profiles` updates until broader SQL action wrappers are introduced.

## Done Criteria

- Last-admin protection has a repo-tracked SQL guard.
- Docs and `WORKLOG.md` reflect the new enforcement layer.
- Verification stays green and the task ends with archived plan artifacts, commit, and push.
