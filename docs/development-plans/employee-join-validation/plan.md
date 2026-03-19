# Employee Join Validation

## Summary

Turn employee invitation links into the first real onboarding gate for new staff accounts. This task captures an invite token on the login route, validates it against `invitation_links`, keeps `Profile Setup` blocked until the token is valid, and consumes the invitation when the employee profile submission succeeds.

## Scope

- Capture an employee invite token from the login route query and keep it through the Google OAuth round-trip for the current onboarding session.
- Query `invitation_links` by token and derive whether the employee can continue onboarding.
- Show invite-validation guidance on `Login` and `Profile Setup` for real Supabase onboarding.
- Block profile submission for employee onboarding when the invite token is missing, invalid, expired, disabled, or already consumed.
- Consume the invite link by setting `consumed_by` and `consumed_at` when profile setup succeeds.
- Add focused tests for join-validation helpers and the updated auth-route behavior.

Out of scope:

- Clipboard copy or native share actions for admin-issued links
- Separate manager or admin candidate onboarding paths
- Transactional server-side join validation via RPC or SQL migrations
- Retroactive cleanup for previously created profile rows without invites

## Implementation Steps

1. Lock the employee join-validation rules in product docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add invitation token parsing and onboarding state helpers, plus a token-validation query against `invitation_links`.
3. Update login and profile-setup flows to capture invite tokens, revalidate them, and block employee profile submission until the token is usable.
4. Extend profile submission to consume the invite token on success, add tests, then run lint/typecheck/unit tests.

## Data / Interface Impact

- Updated auth onboarding flow in `src/features/auth/`
- New invitation join-validation query and helper code under `src/features/invitations/`
- Updated product docs for invite-token onboarding behavior
- No new route; employee onboarding still enters through `Login` and `Profile Setup`

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Invite-aware onboarding can keep the employee token through Google OAuth and into profile setup.
- Employee profile submission is blocked when the invite token is missing or unusable.
- Successful employee profile submission consumes the invite link and routes the user to `Approval Waiting`.
- Existing signed-in users with completed profiles still follow the existing auth routing.

Known gaps:

- Real join validation still depends on the `invitation_links` table and matching RLS policies existing in Supabase.
- Invite consumption and profile creation still run as client-driven sequential writes, so the flow is not server-transactional yet.
- Admin copy or share affordances remain a separate follow-up task.

## Done Criteria

- New employee onboarding can only complete from a valid invitation link.
- Invalid, expired, disabled, or consumed invite links visibly block onboarding.
- Successful employee profile setup consumes the invite token and moves the user to `pending_approval`.
- The task ends with updated tests, `WORKLOG.md`, commit, and push.
