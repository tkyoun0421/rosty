# Members Bulk Approve Slice Summary

## Goal

Add the first bulk member action so admins can approve the currently visible pending users in one step.

## Shipped

- Added a helper for the currently approvable member subset in the active filtered view.
- Added focused regression coverage for the approvable subset helper.
- Updated `src/features/members/ui/members-screen.tsx` with a bulk-approve action card and result notice.
- Updated current archive notes for the richer admin bulk-review flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-25, and `Members` now supports bulk approval for the currently visible pending users.

## Residual Risk

- This is still client-driven sequential approval, not a server-side batch RPC.
- Live member behavior still depends on the tracked members-related migrations being applied to the real Supabase project.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.

## Follow-up

- Decide whether the next members slice is bulk suspend/reactivate, richer audit history, or another admin management affordance.
