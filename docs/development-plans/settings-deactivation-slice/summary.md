# Settings Deactivation Slice Summary

## Goal

Add the account deactivation path to `Settings` so active users can deactivate themselves, but only after all upcoming confirmed assignments are resolved.

## Shipped

- Added the limited self-deactivation RPC in `supabase/migrations/20260321110000_deactivate_my_account_rpc.sql`.
- Blocked self deactivation while upcoming confirmed assignments still exist.
- Added the deactivation client path in `src/features/settings/api/deactivate-my-account.ts` and `src/features/settings/api/use-deactivate-account-mutation.ts`.
- Expanded `src/features/settings/ui/settings-screen.tsx` with a danger section, inline confirmation, and post-success sign-out behavior.
- Updated the Settings-facing product docs and `WORKLOG.md`.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and the app now contains the first limited self-deactivation path in `Settings`.

## Residual Risk

- Live account deactivation still depends on applying `20260321110000_deactivate_my_account_rpc.sql` to the real Supabase project.
- The broader shared scheduling/payroll migrations are still needed in the real project for live assignment-aware behavior there.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the new settings deactivation migration to the real Supabase project.
- Decide whether the next slice is scheduling/staffing write UX, push registration, or another cross-cutting account surface.
