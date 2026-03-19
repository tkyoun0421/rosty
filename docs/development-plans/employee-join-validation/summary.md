# Employee Join Validation Summary

## Goal

Turn employee invitation links into the first real onboarding gate so new staff can only complete profile setup from a valid invite.

## Shipped

- Captured invite tokens from the login route and preserved them through the Google OAuth redirect round-trip.
- Added `invitation_links` token validation for login and profile-setup onboarding guidance.
- Blocked employee profile submission when the invite token is missing, invalid, expired, disabled, or already consumed.
- Consumed the invite link during successful employee profile submission with a best-effort rollback if the profile write fails.
- Locked the login and profile-setup invite validation rules in the product docs.
- Added unit coverage for invite token parsing, onboarding gating, and blocking messages.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- Real join validation still depends on the `invitation_links` table and matching RLS policies existing in Supabase.
- Invite consumption and profile creation still run as client-driven sequential writes, so the flow is not server-transactional yet.
- Admin copy or native share affordances are still not implemented.

## Follow-up

- Add admin copy or share affordances now that the employee invite-consumption route exists.
- Consider moving invite claim and profile creation into a server-enforced transactional path when Supabase migrations are in scope.
