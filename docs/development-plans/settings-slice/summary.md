# Settings Slice Summary

## Goal

Add the first active-user `Settings` workflow so signed-in users can review their core profile fields, update them through a limited RPC path, and sign out from a dedicated route.

## Shipped

- Added `src/app/settings.tsx` and active-user route access for the shared settings route.
- Added the limited self profile-update RPC in `supabase/migrations/20260321103000_update_my_profile_rpc.sql`.
- Added the settings query/mutation/model/UI under `src/features/settings/`.
- Reused the current profile validation rules for `full_name`, `phone_number`, and `gender`.
- Added employee and manager/admin home entry points for the route.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and the app now contains the first shared settings route with limited self profile updates.

## Residual Risk

- Live settings updates still depend on applying the new `update_my_profile` migration to the real Supabase project.
- Account deactivation remains a separate follow-up.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the new settings migration to the real Supabase project.
- Decide whether the next cross-cutting slice is account deactivation, push token registration, or a richer schedule/staffing flow.
