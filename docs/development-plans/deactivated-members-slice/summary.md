# Deactivated Members Slice Summary

## Goal

Surface deactivated accounts as a dedicated read-only section inside `Members`.

## Shipped

- Added explicit deactivated grouping in `src/features/members/model/member-management.ts`.
- Prevented role changes for deactivated member rows.
- Updated `src/features/members/ui/members-screen.tsx` to show a dedicated deactivated section and summary card.
- Updated current archive notes for the clearer admin member-state view.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and admins can now see deactivated accounts in a dedicated read-only section.

## Residual Risk

- There is still no admin-side reactivation path for deactivated users.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Decide whether deactivated accounts should remain permanently read-only or get a controlled restoration path.
- Continue with the next staffing or scheduling slice after the live Supabase rollout catches up.
