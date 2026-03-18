# Google OAuth And Supabase Session

## Summary

Replace the demo-only auth transport with a real Supabase-backed Google OAuth session flow. This task adds a production-shaped Supabase client, restores and subscribes to auth sessions, starts Google OAuth on Expo, and maps authenticated users into the existing auth shell while keeping product role and status on a safe fallback until the `profiles` table path is fully implemented.

## Scope

- Add the required Expo and Supabase auth dependencies for browser auth and secure token storage.
- Rebuild the Supabase client for React Native and web auth session persistence.
- Add Google OAuth start, callback handling, session restore, and sign-out flows.
- Sync Supabase session state into the existing auth shell.
- Query `profiles` when available and fall back to a locked `profile_incomplete` employee session when product profile data is missing.
- Keep demo login available only as a local fallback when config is missing or OAuth is unavailable.
- Add tests for session mapping and the revised auth-shell behavior.

Out of scope:

- Supabase schema migrations for `profiles`
- Invitation link validation and profile form persistence
- Admin approval tooling
- Schedule, assignment, payroll, or notifications implementation

## Implementation Steps

1. Install the Expo and Supabase auth support packages and update app configuration for browser auth.
2. Replace the baseline Supabase client with a platform-aware auth client and secure storage adapter.
3. Add Google OAuth helpers for web and native Expo flows, including callback parsing and sign-out.
4. Refactor auth state management so Supabase session transport is real, while role and status remain mapped through a profile query with a safe fallback.
5. Update the login and guarded auth routes to use the real session bootstrap path and retain demo fallback only when config is missing.
6. Add tests, run lint/typecheck/unit tests, then update `WORKLOG.md` before commit plus push.

## Data / Interface Impact

- Updated auth dependencies and Expo config in `package.json` and `app.json`
- Updated Supabase client and auth integration under `src/shared/lib/supabase/` and `src/features/auth/`
- Updated login/auth shell behavior in `app/` routes and auth UI files
- New auth mapping and session tests under `src/features/auth/`

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Google auth helpers compile on Expo without type errors
- Auth shell resolves from a restored Supabase session
- Fallback profile mapping keeps unauthorized users out of role homes
- Lint, typecheck, and unit tests pass

Known gaps:

- Real OAuth success still depends on valid Supabase and Google provider configuration in the environment
- Native E2E coverage is still out of scope for this task

## Done Criteria

- The login screen can start a real Google OAuth flow when config is present
- Supabase session restore survives app restarts
- Sign-out clears the real auth session and returns to login
- Users with no app profile record land in the safe fallback status instead of entering an active home route
- The completed plan can be archived under a feature folder with `plan.md` and `summary.md`
