# Auth Shell And Dashboard Foundation Summary

## Goal

Replace the Expo bootstrap landing page with the first real Rosty auth shell and role-aware home entry.

## Shipped

- Added a persisted Zustand auth session store with guarded routing for login, profile setup, approval waiting, suspended, employee home, and manager home.
- Replaced the bootstrap landing page with auth-aware entry routing through Expo Router.
- Added TanStack Query dashboard hooks and role-specific employee versus manager/admin home shells.
- Added unit coverage for auth route rules and dashboard rendering.
- Added the plan-archive workflow rule so completed feature plans move into a feature folder with `summary.md`.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Result: all passed on 2026-03-18.

## Residual Risk

- The auth shell still uses local demo sessions rather than real Google OAuth or Supabase auth.
- No native E2E coverage exists yet for the new navigation flow.

## Follow-up

- Plan the real Google OAuth and Supabase session integration task.
- Keep future feature plans archived under their feature slug folder with `summary.md`.