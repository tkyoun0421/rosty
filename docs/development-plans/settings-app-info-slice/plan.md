# Settings App Info Slice

## Summary

Expose a read-only app info section inside `Settings` using the current Expo config and local env state.

## Scope

- Add a small settings app-info helper built from `expo-constants` and the current env.
- Show app name, version, environment, auth mode, bundle identifiers, and current delivery status inside `Settings`.
- Keep the section read-only with no new permissions or settings writes.
- Refresh IA/worklog archive references.

Out of scope:

- Real push permission prompts
- Notification settings
- Device token registration
- In-app version update prompts

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the settings app-info slice.
2. Add the helper and focused regression coverage for the app-info shape.
3. Integrate the new read-only section into `Settings`.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- New settings app-info helper under `src/features/settings/model/`
- Updated `Settings` UI under `src/features/settings/ui/`
- Updated IA/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- `Settings` shows read-only app name, version, environment, auth mode, and package identifiers.
- The delivery status copy is explicit about the current build limitation.
- No new write or permission flows are introduced.

Known gaps:

- Real push permission status is still unavailable without the later push-delivery slice.

## Done Criteria

- `Settings` contains the new app-info section.
- The slice is committed and pushed after verification.
