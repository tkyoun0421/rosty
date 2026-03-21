# Global Search Slice Summary

## Goal

Add the first active-user `Global Search` workflow so users can search schedules and their own assignment routes from one screen, while managers/admins can also search members through a minimal read-side member directory path.

## Shipped

- Added `src/app/search.tsx` and active-user route access for the shared search route.
- Added the minimal member-directory search RPC in `supabase/migrations/20260320160000_member_directory_search_rpc.sql`.
- Added the search query/model/UI under `src/features/search/`.
- The first slice now searches:
  - schedules for all active users
  - the current user's grouped assignments for all active users
  - active member directory rows for manager/admin only
- Added employee and manager/admin home entry points for the route.

## Verification

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Result: the repo verification baseline passed on 2026-03-21, and the app now contains the first shared search route with role-gated result sections.

## Residual Risk

- Live member search still depends on applying the new member-directory search migration to the real Supabase project.
- Employee users still do not search members, by design.
- Real Google OAuth still needs a manual retest on a dev build or standalone app.
- The first persistent admin bootstrap still needs a real target auth user before admin-route QA can continue.

## Follow-up

- Apply the member-directory search migration to the real Supabase project.
- Expand search result depth or ranking if needed after the core scheduling/staffing flows are stable.
- Consider push-token registration or richer schedule/action flows as the next cross-cutting slice.
