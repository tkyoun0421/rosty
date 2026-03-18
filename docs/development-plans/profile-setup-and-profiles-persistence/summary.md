# Profile Setup And Profiles Persistence Summary

## Goal

Turn the real `Profile Setup` route into a working profile submission flow that persists the signed-in user into `profiles` and moves the auth shell to `pending_approval`.

## Shipped

- Added profile setup validation for `full_name`, `phone_number`, and `gender`.
- Added a Supabase `profiles` upsert API and TanStack Query mutation that refreshes auth state after a successful submission.
- Replaced the real-session placeholder in `Profile Setup` with an actual form while keeping the demo-only transitions for local fallback mode.
- Preserved prefilled display names from the Google session when available.
- Added unit coverage for profile setup defaults, phone normalization, and validation errors.
- Confirmed the stray GitHub PAT example is not referenced by the app codebase.

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Result: all passed on 2026-03-19.

## Residual Risk

- No live write was executed automatically because that would create real user data in Supabase.
- Real submission still depends on the `profiles` table and self-service RLS policies matching the schema design.
- Approval from `pending_approval` to `active` still requires a separate admin feature.

## Follow-up

- Implement the admin member approval and status-management flow.
- Add invitation-link validation before employee activation.
- Add device-level verification for real profile submission once a test user path is ready.
