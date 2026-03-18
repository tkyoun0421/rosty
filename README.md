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

## Quick Start

1. Copy `.env.example` to `.env` and fill the public keys.
2. Run `pnpm install`.
3. Run `pnpm start` or `pnpm android`.
4. Run `pnpm verify`.

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

## Docs

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
- The existing `.env` token should be rotated before any remote integration work continues.


