# Schedule List Filter Slice Summary

## Goal

Add the shared `top tab + chip` filtering structure to `Schedule List`.

## Shipped

- Added schedule list filter helpers in `src/features/schedules/model/schedules.ts`.
- Added focused regression coverage for the new tab/chip filtering behavior.
- Updated `src/features/schedules/ui/schedule-list-screen.tsx` with `all / collecting / assigned / closed` tabs and `all / open / locked` chips.
- Added a filtered empty state so the list stays readable when a subset has no items.
- Updated current archive notes for the richer schedule browsing flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-23, and `Schedule List` now uses the shared top-tab plus chip filter pattern.

## Residual Risk

- Live behavior still depends on the tracked scheduling schema being applied to the real Supabase project.
- Date-range filtering and search inside the list are still unimplemented.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the tracked scheduling migrations to the real Supabase project.
- Decide whether the next schedule-list slice is date-range filtering, search, or another list affordance.
