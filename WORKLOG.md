# WORKLOG

## Current Task

Pending manual Google OAuth retest and first-admin bootstrap execution after completing the callback redirect bug fix.

## Plan Doc

- Archive summary: `docs/development-plans/oauth-callback-redirect-fix/summary.md`
- Archive plan: `docs/development-plans/oauth-callback-redirect-fix/plan.md`

## Last Completed

Completed the Google OAuth callback redirect fix task:

- Updated `src/app/auth/callback.tsx` so the callback route actively processes the returned deep-link URL instead of rendering a passive loading screen only.
- Made `completeOAuthRedirect(...)` idempotent in `src/features/auth/model/auth-store.ts` so repeated handling of the same auth code does not trigger duplicate session exchanges.
- Hardened OAuth code and invite token parsing in `src/features/auth/lib/google-oauth.ts` for query-string and hash-fragment callbacks.
- Added focused regression coverage in `tests/auth/callback-route.test.tsx` and `src/features/auth/lib/google-oauth.test.ts`.
- Reconfirmed the repo gate with lint, typecheck, unit tests, and export build verification.

## Next Action

Re-run Google sign-in on the target device or emulator, confirm the app exits `auth/callback` cleanly, then bootstrap the first persistent admin and continue app-level admin QA.

## Blockers

- The callback fix is verified locally by tests and export builds, but the live Google OAuth round-trip still needs manual device or emulator confirmation.
- The real project still has no persistent admin account because this session does not yet have the intended target auth user email or UUID for the bootstrap command.
- The fetched legacy single-hall tables remain in the remote project until a later cleanup task is explicitly locked.
- The manager-facing payroll and broader payroll calculation surfaces are still unimplemented.

## Latest Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- Completed the Google OAuth callback redirect fix task on 2026-03-20.
