# Rosty Setup Guide

## Prerequisites

- Node.js 22.x
- pnpm 10.x
- Expo-compatible Android emulator or device
- macOS + Xcode only when you need native iOS work

## Environment Variables

Copy `.env.example` to `.env` and fill the values below.

Runtime app values:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`
- `EXPO_PUBLIC_NAVER_CLIENT_ID`

Migration rollout values:

- `SUPABASE_PROJECT_ID` (optional when `EXPO_PUBLIC_SUPABASE_URL` uses the default project host)
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

## Supabase Google OAuth Setup

Configure Google sign-in in the Supabase dashboard before testing the real auth flow.

- Enable the Google provider under `Authentication > Providers`.
- Add the native redirect URL `rosty://auth/callback`.
- Add the current Expo web callback URL for browser testing, such as `http://localhost:8081/auth/callback` or the active HTTPS localhost origin if you are using a secure web session.
- Keep the Google client credentials inside Supabase provider settings, not in the Expo public env.

## Local Run

1. `pnpm install`
2. `pnpm start`
3. `pnpm android`

Use `pnpm ios` only on macOS with the required Apple tooling.

## Supabase Migration Rollout

The repo now carries a local Supabase CLI wrapper and checked-in `supabase/config.toml` so rollout commands do not depend on ad hoc machine setup.

### Local machine path

1. Run `pnpm install`.
2. Confirm the local CLI is ready with `pnpm supabase -- --version`.
3. Fill `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` in `.env`.
4. Run `pnpm supabase:migrations:status` to link the project and inspect pending migrations.
5. Run `pnpm supabase:migrations:dry-run` before any real apply.
6. Run `pnpm supabase:migrations:apply` only after reviewing the dry-run output and any remote schema drift.

Notes:

- The migration scripts run `supabase link --project-ref ... --password ...` first and keep link metadata under `supabase/.temp/`.
- `SUPABASE_PROJECT_ID` is optional when the standard Supabase project ref can be derived from `EXPO_PUBLIC_SUPABASE_URL`.
- If the CLI binary is missing after install, rerun `pnpm supabase:install`.

### GitHub Actions path

Use `.github/workflows/supabase-migrations.yml` when local privileged credentials are unavailable.

1. Add repository secrets: `SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`.
2. Open `Actions > Supabase Migration Rollout`.
3. Run the workflow with `mode=dry-run` first.
4. Only use `mode=apply` after reviewing the dry-run output and setting `confirm_apply=APPLY`.

## Native Project Policy

- This repository starts managed-first.
- Generate native folders only when needed:
  - `pnpm prebuild:android`
  - `pnpm prebuild:ios`
- Do not commit local secrets into generated native files.

## Build and Release Baseline

- Local build check: `pnpm build`
- Cloud build baseline: EAS with `development`, `preview`, and `production` profiles from `eas.json`

## Detox Notes

- Android Detox requires a generated Android project, JDK, Android SDK, and an emulator.
- iOS Detox requires macOS, Xcode, and a generated iOS project.
