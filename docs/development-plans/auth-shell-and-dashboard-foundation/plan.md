# Auth Shell And Dashboard Foundation

## Summary

Replace the Expo bootstrap landing page with the first real Rosty app shell. This task adds a persisted auth session model, state-based entry routing, guarded auth/status screens, and minimal employee versus manager home dashboards built on the repo's `zustand` and `@tanstack/react-query` standards.

## Scope

- Add a persisted local auth session store with `signed_out`, `profile_incomplete`, `pending_approval`, `active`, and `suspended` flows.
- Add guarded routes for `Login`, `Profile Setup`, `Approval Waiting`, `Suspended`, `Employee Home`, and `Manager Home`.
- Add role-specific home screens with query-backed mock dashboard data that matches the PRD priorities.
- Add tests for auth route resolution, auth transition rules, and dashboard rendering.

Out of scope:

- Real Google OAuth token exchange
- Supabase-backed auth or profile APIs
- Members, schedules, assignments, payroll, notifications, or settings feature implementation
- Production-grade admin approval tooling

## Implementation Steps

1. Define auth session types, route resolution rules, transition helpers, and the persisted Zustand store.
2. Replace the root landing route with auth-aware entry routing and guarded screen routes for each allowed auth state.
3. Implement minimal product screens for login, profile setup, approval waiting, suspended, employee home, and manager home.
4. Add TanStack Query hooks and mock dashboard services so role-specific homes consume server-shaped data through query boundaries.
5. Add tests, run lint/typecheck/unit tests, then update `WORKLOG.md` with verification and next action before commit plus push.

## Data / Interface Impact

- New auth session model, route guards, and local store under `src/features/auth/`
- New home dashboard query layer and role-specific screens under `src/features/home/`
- New app routes under `app/` for auth, status, and role home entry points
- Replaced bootstrap landing screen usage from `app/index.tsx`

## Test Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

Expected pass criteria:

- Auth route resolution and transition tests pass
- Dashboard screen tests render the expected role-specific content
- No lint or TypeScript errors remain

Known gaps:

- No live OAuth or Supabase session integration in this task
- No native E2E coverage for the new navigation shell yet

## Done Criteria

- App launch resolves to the correct screen based on the stored auth state
- Unauthorized routes redirect back to the correct allowed state screen
- Active employees land on `Employee Home`
- Active managers and admins land on `Manager Home`
- Role home data is queried through TanStack Query rather than embedded directly in the store
