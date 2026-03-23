# Schedule List Search and Date-Range Slice Summary

## Goal

Add local search and date-range filtering to `Schedule List` on top of the existing tabs and collection chips.

## Shipped

- Extended the schedule list filter helper so it also matches local query text and date-range chips.
- Added focused regression coverage for date-range and search behavior.
- Updated `src/features/schedules/ui/schedule-list-screen.tsx` with `all dates / next 7 days / later / past` chips and a search field.
- Updated current archive notes for the richer schedule browsing flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-23, and `Schedule List` now supports local search plus date-range filtering on top of the existing controls.

## Residual Risk

- This is still local client-side filtering on the loaded schedule snapshot.
- Live behavior still depends on the tracked scheduling schema being applied to the real Supabase project.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked scheduling migrations to the real Supabase project.
- Decide whether the next schedule-list follow-up is saved filters, server-side search, or another shared list affordance.
