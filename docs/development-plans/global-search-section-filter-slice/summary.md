# Global Search Section Filter Slice Summary

## Goal

Add result-type chips to `Global Search` so users can narrow the current search view to schedules, assignments, or members.

## Shipped

- Added section-type chip helpers in `src/features/search/model/global-search.ts`.
- Added focused regression coverage for the new chip visibility helper.
- Updated `src/features/search/ui/global-search-screen.tsx` with result-type chips and section-level empty states.
- Updated current archive notes for the richer shared search flow.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-25, and `Global Search` now supports result-type chips on top of the existing query.

## Residual Risk

- This is still client-side section filtering on the loaded search snapshot.
- Live member search still depends on applying the member-directory search migration to the real Supabase project.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.

## Follow-up

- Apply the member-directory search migration to the real Supabase project.
- Decide whether the next search slice is richer ranking, saved search state, or another cross-cutting discovery affordance.
