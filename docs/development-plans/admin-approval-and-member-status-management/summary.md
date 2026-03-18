# Admin Approval And Member Status Management Summary

## Goal

Add the first real admin members workflow so pending users can be approved, active access can be suspended or restored, and roles can be managed inside the app shell.

## Shipped

- Added an admin-only `Members` route behind the existing auth guard.
- Added a `profiles` query plus admin mutations for approve, suspend, reactivate, and role changes.
- Added client-side last-active-admin protection so the final active admin cannot be suspended or downgraded.
- Added an admin entry point from the existing manager/admin home screen.
- Added unit coverage for members route access and last-admin protection logic.
- Cleaned the remaining mojibake in the home dashboard seed strings while touching related admin home entry code.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- No live admin mutation was executed automatically because that would modify real user rows in Supabase.
- Real success still depends on `profiles` admin write policies and matching server-side protections.
- `deactivated`, invitation-link issuance, and pay-policy management remain separate follow-up features.

## Follow-up

- Implement invitation-link issuance and employee join validation.
- Add server-side SQL protections for the last-admin rule.
- Extend the admin area with pay policy and invitation management screens.
