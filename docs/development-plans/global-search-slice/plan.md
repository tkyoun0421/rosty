# Global Search Slice

## Summary

Add the first active-user `Global Search` workflow so users can search schedules and their own assignment routes from one screen, while managers/admins can also search members through a minimal read-side member directory path.

## Scope

- Add a protected `Global Search` route for all active users.
- Search schedules for all active users.
- Search only the current user's assignment routes from the tracked grouped assignment data.
- Add the minimal `member_directory` read path needed for manager/admin member search.
- Keep the slice read-only.

Out of scope:

- Full-text ranking or typo tolerance
- Employee access to member search
- Search analytics or saved searches
- Cross-entity deep filtering beyond a basic query string

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the global search slice.
2. Add the minimal read-side member directory path and implement the search query/model with safe fallback.
3. Implement the protected route/UI and add entry points from the home screens.
4. Add focused tests, rerun verification, then commit/push the slice.

## Data / Interface Impact

- New route under `src/app/`
- New search files under `src/features/search/`
- Minimal member directory migration under `supabase/migrations/`
- Updated auth-route access, home navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active users can open the new global search route.
- Search returns schedules and personal assignments for all active users.
- Manager/admin searches also return member results while employees do not see them.
- The repo verification baseline still passes.

Known gaps:

- Live search still depends on applying the minimal member-directory migration to the real Supabase project.

## Done Criteria

- The app contains a shared Global Search route.
- Search respects role-based result visibility.
- The slice is committed and pushed after verification.
