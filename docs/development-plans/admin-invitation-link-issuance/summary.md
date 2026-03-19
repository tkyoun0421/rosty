# Admin Invitation Link Issuance Summary

## Goal

Add the first admin-only `Invitation` workflow so admins can issue and manage employee invite links from the app.

## Shipped

- Added an admin-only `Invitation` route behind the existing auth guard.
- Queried `invitation_links` and derived `active`, `consumed`, `expired`, and `disabled` states for the admin UI.
- Added admin mutations for issue, reissue, and disable actions on employee invite links.
- Added a `Members -> Invitation` entry point inside the admin shell.
- Locked the 7-day invite expiry and reissue semantics in the product docs.
- Added unit coverage for invitation state helpers and admin route access.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- Real invite mutations still depend on the `invitation_links` table and matching admin RLS policies existing in Supabase.
- Token generation still happens on the client because a server-side issuance path is not implemented yet.
- Employee-side join validation against issued invitation tokens remains a separate follow-up task.

## Follow-up

- Implement employee join validation in the auth flow.
- Add copy or share affordances once the employee invite-consumption route exists.
