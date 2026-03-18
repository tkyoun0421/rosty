# Google OAuth And Supabase Session Summary

## Goal

Replace the demo-only auth transport with a real Supabase-backed Google OAuth session that restores across app launches and feeds the existing auth shell.

## Shipped

- Added `expo-secure-store`, `expo-web-browser`, and `react-native-url-polyfill`, then rebuilt the Supabase client with platform-aware persisted auth storage.
- Added an auth bootstrap layer that restores the Supabase session on launch and subscribes to auth state changes.
- Added real Google OAuth start, callback exchange, and sign-out handling while keeping demo personas as a non-production fallback.
- Added profile lookup plus a safe `employee` and `profile_incomplete` fallback when the `profiles` row is missing or incomplete.
- Updated the login and status screens so real sessions stay read-only where product forms are not implemented yet.
- Updated setup documentation to reflect the new Supabase-managed Google OAuth configuration and redirect URLs.
- Added unit coverage for auth session fallback and profile merge behavior.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- Real end-to-end Google sign-in still depends on the Supabase dashboard redirect URLs and provider credentials being configured correctly.
- Real `profile_incomplete`, `pending_approval`, and `suspended` routes are still safe placeholders until the profile form and admin approval features are built.
- Native E2E coverage for OAuth is still missing.

## Follow-up

- Implement the real profile setup form and `profiles` write path on top of the new auth session.
- Add admin approval tooling so pending and suspended states can change through product flows.
- Add device-level E2E coverage for the OAuth flow once credentials are available.
