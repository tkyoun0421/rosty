---
plan: 01-01
phase: 01-access-foundation
status: completed
created: 2026-03-31
---

# Summary: 01-01

## What Changed

- Locked `#app/*`, `#flows/*`, `#mutations/*`, `#queries/*`, and `#shared/*` aliases in `tsconfig.json` and `vitest.config.ts`
- Added `eslint.config.mjs` to enforce the layer direction `app -> flows -> mutations -> queries -> shared`
- Added thin app shell files under `src/app/`
- Added executable shared contracts under `src/shared/config/` and `src/shared/model/`

## Verification

- `pnpm exec vitest run src/shared/config/auth-config.test.ts src/shared/model/access.test.ts`
- `pnpm exec eslint src --max-warnings 0`
- `pnpm build`

## Key Files

- `src/app/layout.tsx`
- `src/app/_providers/AppProviders.tsx`
- `src/shared/config/auth-config.ts`
- `src/shared/model/access.ts`
