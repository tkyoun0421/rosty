---
plan: 01-02
phase: 01-access-foundation
status: completed
created: 2026-03-31
---

# Summary: 01-02

## What Changed

- Added Supabase browser/server/admin wrappers under `src/shared/lib/supabase/`
- Added DB-aware current-user read under `src/queries/access/dal/get-current-user.ts`
- Added Google sign-in start action, callback route, root split flow, and unauthorized route
- Added coarse `proxy.ts` redirects without final authorization logic

## Verification

- `pnpm exec vitest run src/queries/access/dal/get-current-user.test.ts src/mutations/auth/actions/start-google-sign-in.test.ts src/flows/auth-shell/components/RootRedirectPage.test.tsx src/app/auth/callback/route.test.ts`
- `pnpm build`

## Key Files

- `src/shared/lib/supabase/browser-client.ts`
- `src/shared/lib/supabase/server-client.ts`
- `src/queries/access/dal/get-current-user.ts`
- `src/app/auth/callback/route.ts`
- `src/flows/auth-shell/components/RootRedirectPage.tsx`
