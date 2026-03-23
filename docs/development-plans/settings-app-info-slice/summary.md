# Settings App Info Slice Summary

## Goal

Expose a read-only app info section inside `Settings` using the current Expo config and local env state.

## Shipped

- Added the settings app-info helper in `src/features/settings/model/settings-app-info.ts`.
- Added focused regression coverage in `src/features/settings/model/settings-app-info.test.ts`.
- Updated `src/features/settings/ui/settings-screen.tsx` to show app name, version, environment, auth mode, package identifiers, and current delivery status.
- Updated current archive notes for the richer settings information surface.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-23, and `Settings` now contains a read-only app-info section.

## Residual Risk

- Real push permission status is still unavailable without the later push-delivery slice.
- The app still does not expose in-app version update prompts.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Decide whether the next settings slice is real push permission status, app update prompts, or another account-management view.
