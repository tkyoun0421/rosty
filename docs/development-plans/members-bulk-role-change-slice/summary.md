# Members Bulk Role Change Slice Summary

## Goal

Extend the bulk member action set so admins can apply role changes to the eligible members in the current filtered view.

## Shipped

- Added helpers for the currently role-changeable member subsets per target role.
- Reused the existing single-member role-change mutation path for bulk role updates across the current filtered view.
- Updated `src/features/members/ui/members-screen.tsx` with bulk role-change action cards for `employee / manager / admin`.
- Updated current archive notes for the richer admin bulk-role flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-25, and `Members` now supports the first bulk role-change action set for the current filtered view.

## Residual Risk

- This is still client-driven sequential execution, not a server-side batch RPC.
- Live member behavior still depends on the tracked members-related migrations being applied to the real Supabase project.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.

## Follow-up

- Decide whether the next members slice is richer audit history, batch RPC hardening, or another admin management affordance.
