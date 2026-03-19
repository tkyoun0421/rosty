# Admin Invitation Link Issuance

## Summary

Add the first admin-only `Invitation` workflow on top of the completed members management feature. This task introduces a protected admin route, reads `invitation_links` from Supabase, lets admins issue a new employee invite link, reissue an active link by disabling the old row and creating a replacement, and review current plus historical invite status from the app.

## Scope

- Add an admin-only `Invitation` route reachable from the `Members` screen.
- Query `invitation_links` for the admin invitation screen and derive display state from `disabled_at`, `expires_at`, and `consumed_at`.
- Support issuing new employee invite links with a fixed V1 expiry of 7 days from issuance.
- Support reissuing an active invite link by disabling the current row and creating a fresh replacement token.
- Support manually disabling an active invite link without reissuing it.
- Show active and historical invitation records with focused admin context and status labels.
- Add focused tests for route access and invitation state or action helpers.

Out of scope:

- Employee-side invitation validation during login or profile setup
- Non-`employee` invitation roles
- Bulk invitation flows
- Native share-sheet or clipboard integration
- Server-enforced transactional reissue guarantees or SQL migrations

## Implementation Steps

1. Lock the invitation-link issuance rules in product docs, create this plan, and update `WORKLOG.md` before implementation starts.
2. Add admin auth routing plus invitation model and API helpers for query, token generation, state derivation, and issue or reissue or disable mutations.
3. Build the `Invitation` screen UI and wire navigation from `Members`.
4. Add tests, run lint/typecheck/unit tests, then update `WORKLOG.md` before commit plus push.

## Data / Interface Impact

- New admin invitation management code under `src/features/invitations/`
- Updated auth routing and a new `app/invitation.tsx` route
- Updated `Members` screen with an `Invitation` entry point
- Updated PRD, schema, IA, and state tables for locked invitation issuance rules

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Only active admins can open the `Invitation` route.
- Admin invite issuance creates an `employee` invitation row with a 7-day expiry.
- Reissue disables the previous active link and creates a replacement invite row.
- Disabled, expired, consumed, and active invitation states are derived consistently in the UI or helper layer.

Known gaps:

- Real mutations still depend on the `invitation_links` table and admin RLS policies existing in Supabase.
- Token generation still happens on the client because server-side signing or RPC support is not implemented yet.
- Employee join validation against invitation tokens remains a separate follow-up task.

## Done Criteria

- Admins can open a dedicated `Invitation` screen from `Members`.
- Admins can issue, reissue, and disable employee invitation links from the app.
- Invitation history renders stable status labels for active, consumed, expired, and disabled rows.
- The task ends with updated tests, `WORKLOG.md`, commit, and push.
