# WORKLOG

## Current Task

Plan the next feature on top of the new auth session: real profile setup submission and `profiles` persistence.

## Plan Doc

- Pending. Create the next plan under `docs/development-plans/` before implementation starts.

## Last Completed

Completed the Google OAuth and Supabase session integration task:

- Added a platform-aware Supabase auth client with secure persisted session storage for native and browser-safe storage for web.
- Connected real Google OAuth start, callback code exchange, session restore, auth subscription, and sign-out into the existing auth shell.
- Added safe `profiles` lookup with fallback to `employee` plus `profile_incomplete` when product profile data is missing.
- Kept demo personas only as local non-production fallback entries.
- Updated `.env.example` and the setup guide for Supabase-managed Google OAuth redirect configuration.
- Archived the completed feature plan into `docs/development-plans/google-oauth-and-supabase-session/` with `plan.md` and `summary.md`.

## Next Action

Lock the profile setup form and `profiles` upsert plan, then implement the real submission flow that moves a signed-in user out of the fallback state.

## Blockers

Real end-to-end OAuth still requires Supabase Google provider configuration, including `rosty://auth/callback` and the active Expo web callback URL when browser testing is needed.

## Latest Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual readback of edited files after shell-based writes because `apply_patch` continued failing with the Windows sandbox refresh error.
- Encoding scan for mojibake markers in tracked app, src, docs, and env files returned no matches.
