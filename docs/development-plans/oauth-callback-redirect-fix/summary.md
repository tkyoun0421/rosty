# OAuth Callback Redirect Fix Summary

## Goal

Fix the Google OAuth callback path so the app exchanges the returned Supabase auth code after the browser redirects back to `auth/callback`, instead of stalling or failing during session restoration.

## Shipped

- Updated `src/app/auth/callback.tsx` so the callback route now reads the current deep-link URL, calls the auth-store redirect completion path, and exits to the resolved auth route after processing.
- Updated `src/features/auth/model/auth-store.ts` so repeated handling of the same OAuth code is idempotent and overlapping callback processing does not trigger duplicate exchange attempts.
- Updated `src/features/auth/lib/google-oauth.ts` so OAuth code and invitation token extraction work from either the query string or hash fragment.
- Added focused regression coverage in `tests/auth/callback-route.test.tsx` and `src/features/auth/lib/google-oauth.test.ts`.
- Kept the `src/app` router tree route-only by moving the callback route test outside the router directory after export bundling exposed the mistake.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-20, and the callback route now processes the returned OAuth URL in the app runtime instead of remaining a passive loading screen.

## Residual Risk

- The live Google OAuth round-trip still needs to be rechecked manually on the current device or emulator against the active Supabase redirect settings.
- The real project still needs the first persistent admin bootstrap execution before admin-route QA can proceed.
- The fetched legacy single-hall tables remain in the remote project until a later cleanup task is explicitly locked.
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Follow-up

- Re-run Google sign-in on device or emulator and confirm the app now leaves `auth/callback` cleanly.
- After the target auth user exists, run the first-admin bootstrap command and continue with app-level admin QA.
