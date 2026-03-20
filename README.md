# Rosty

Rosty is a React Native app for wedding hall operators and staff.
This repository now starts from a fresh Expo Router baseline with Supabase-ready configuration, CI scaffolding, and local verification commands.

## Stack

- Expo Router
- React Native
- TypeScript
- Zustand
- TanStack Query
- Supabase
- Jest + React Native Testing Library
- Detox

## Project Layout

- `src/app/`: Expo Router route files, layouts, and route-only entry modules
- `src/features/`: feature slices for auth, home, invitations, members, and payroll
- `src/shared/`: shared providers, config, and reusable library code
- `supabase/`: tracked migrations, CLI config, and seed baseline

Route files now live under `src/app` only. Keep non-route modules outside the Expo Router tree so they are not treated as routes by accident.

## Quick Start

1. Copy `.env.example` to `.env` and fill the public keys.
2. Put rollout-only Supabase migration secrets in `.env.local` or CI secret storage.
3. Run `pnpm install`.
4. Run `pnpm start` or `pnpm android`.
5. Run `pnpm verify`.

## Scripts

- `pnpm start`
- `pnpm android`
- `pnpm ios`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build` (Android/iOS export validation)
- `pnpm verify`
- `pnpm prebuild:android`
- `pnpm prebuild:ios`
- `pnpm test:e2e:android`
- `pnpm test:e2e:ios`
- `pnpm supabase -- --version`
- `pnpm supabase:migrations:status`
- `pnpm supabase:migrations:dry-run`
- `pnpm supabase:migrations:apply`
- `pnpm supabase:first-admin -- --email <email>`

## Docs

- [Agent Workflow](AGENTS.md)
- [Development Plan Rules](docs/development-plans/README.md)
- [Current Task Pointer](WORKLOG.md)
- [PRD](docs/product/prd.md)
- [Supabase Schema Design](docs/product/supabase-schema.md)
- [Screen IA](docs/product/screen-ia.md)
- [State Tables](docs/product/state-tables.md)
- [Setup Guide](docs/product/setup.md)
- [Verification Guide](docs/ops/verification.md)
- [Secrets Policy](docs/ops/secrets.md)

## Notes

- Android can be verified locally on Windows.
- iOS native builds and Detox execution require macOS with Xcode.
- `pnpm install` now bootstraps the repo-local Supabase CLI binary used by the migration scripts.
- Migration scripts reject example placeholder secrets before the Supabase CLI runs and let `.env.local` override placeholder rollout values from `.env`.
- The first persistent admin is promoted out of band with `pnpm supabase:first-admin` after the target user exists in Supabase Auth.
- Real native Google OAuth testing requires a development build or standalone app. Expo Go cannot reopen the custom `rosty://auth/callback` URL.
