# Deactivated Auth Lockout Slice Summary

## Goal

Make `deactivated` a first-class auth status so blocked accounts cannot re-enter the app shell through stale restored sessions.

## Shipped

- Extended auth status parsing so `deactivated` is treated as a valid profile state.
- Updated routing rules so deactivated sessions resolve back to `Login` instead of protected app routes.
- Added auth-store normalization that drops restored deactivated sessions back to the login shell with a blocked message.
- Updated current archive notes for the stronger account-deactivation lockout behavior.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and restored deactivated sessions no longer re-enter the app shell.

## Residual Risk

- The product still does not expose a dedicated deactivated guidance screen.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Decide whether to add a dedicated deactivated guidance screen or keep the login-shell blocked message as the final UX.
- Continue with the next staffing or scheduling slice after the live Supabase rollout catches up.
