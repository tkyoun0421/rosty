# Verification Guide

## Required Commands

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Full Local Gate

- `pnpm verify`

This runs lint, typecheck, unit tests, and Android/iOS Expo export build checks.

## E2E Entry Points

- `pnpm test:e2e:android`
- `pnpm test:e2e:android:build`
- `pnpm test:e2e:ios`
- `pnpm test:e2e:ios:build`

## CI Baseline

- Pull requests run install, lint, typecheck, and unit tests.
- Pushes to `main` run the same checks plus the build export command.

## Current Limits

- Android E2E depends on local native artifacts created after `pnpm prebuild:android`.
- iOS verification cannot be completed on Windows.

