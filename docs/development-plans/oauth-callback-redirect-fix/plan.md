# OAuth Callback Redirect Fix

## Summary

Fix the Google OAuth callback path so a redirected app session actually exchanges the Supabase auth code and restores the user session instead of stalling or failing after the browser returns to the app.

## Scope

- Reproduce the callback handling gap from the current route and auth-store flow.
- Add a repo-tracked callback handling path that processes the current redirect URL inside the callback route.
- Keep the fix limited to the existing Google OAuth and Supabase PKCE flow.
- Add focused regression coverage for the callback URL parsing or handling logic.

Out of scope:

- New auth providers or auth UX redesign
- Broader navigation refactors outside the callback path
- Real-device E2E automation

## Implementation Steps

1. Update `WORKLOG.md` so the active task points to this callback redirect bug fix.
2. Implement the minimal callback route and auth-store changes needed to process the returned OAuth URL safely and idempotently.
3. Add focused tests for the callback handling logic and rerun the repo verification baseline.
4. Update `WORKLOG.md` with the verification result, remaining blockers, and next action.

## Data / Interface Impact

- Auth callback route under `src/app/auth/`
- Auth store or OAuth helper logic under `src/features/auth/`
- Focused tests under `src/features/auth/` or `tests/`
- `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Redirecting back into `auth/callback` processes the returned URL instead of leaving the app in a broken state.
- Repeated handling of the same callback URL does not create duplicate exchange attempts.
- The repo verification baseline still passes.

Known gaps:

- The live Google OAuth round-trip still depends on the local device or emulator path and current Supabase project settings.

## Done Criteria

- The callback route actively processes the redirect URL and exits to the correct auth route.
- The fix is protected by focused regression coverage.
- `WORKLOG.md` reflects the completed bug fix and the next manual QA step.
