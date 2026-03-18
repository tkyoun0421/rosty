# Admin Approval And Member Status Management

## Summary

Add the first real admin-only `Members` workflow. This task introduces a protected admin route, reads member rows from `profiles`, lets admins approve pending users, suspend or reactivate access, change roles, and blocks mutations that would remove the last active admin.

## Scope

- Add an admin-only `Members` route under the existing auth shell.
- Query `profiles` for the member-management screen.
- Support admin actions for `pending_approval -> active`, `pending_approval|active -> suspended`, `suspended -> active`, and role changes among `employee`, `manager`, and `admin`.
- Add client-side last-active-admin protection before suspend or role downgrade.
- Add an admin entry point from the current admin home screen.
- Add focused tests for route access and last-admin protection logic.

Out of scope:

- `deactivated` account management
- Invitation-link issuance or validation
- Pay policy and pay rate management
- Audit log UI
- Server-enforced last-admin SQL protections or migrations

## Implementation Steps

1. Extend auth routing with an admin-only `Members` screen entry.
2. Add member queries and mutations against `profiles`, plus helper logic for allowed admin actions and last-admin protection.
3. Build the `Members` screen UI with status grouping and inline admin actions.
4. Add tests, run lint/typecheck/unit tests, then update `WORKLOG.md` before commit plus push.

## Data / Interface Impact

- New admin member-management code under `src/features/members/`
- Updated auth routing and admin home entry
- New `app/members.tsx` route

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Only active admins can open the `Members` route.
- Admin mutations update member status and role through the query layer.
- The client blocks suspend or role downgrade when the target is the last active admin.

Known gaps:

- Real mutation success still depends on `profiles` write policies for admins existing in Supabase.
- Server-side SQL enforcement for last-admin protection is still separate from this client implementation.

## Done Criteria

- Admins can review pending, active, and suspended users from a dedicated screen.
- Pending users can be approved, active users suspended, suspended users reactivated, and roles changed.
- Last active admin protection is enforced in the client UI and mutation layer.
- The task ends with updated tests, `WORKLOG.md`, commit, and push.
