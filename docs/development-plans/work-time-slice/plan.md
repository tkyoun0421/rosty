# Work Time Slice

## Summary

Add the first manager/admin `Work Time` workflow so operators can review and save planned/actual start/end times for a schedule from a dedicated route.

## Scope

- Add a protected `Work Time` route for active manager/admin users.
- Reuse the tracked `schedule_time_records` schema with safe seeded fallback until the real migration is applied remotely.
- Allow saving/updating planned and actual schedule times.
- Link the route from `Schedule Detail` and `Manager Home`.

Out of scope:

- Employee self time tracking
- Time correction history/audit UI
- Automatic payroll recalculation UI feedback beyond query invalidation
- Scheduling create/edit flows

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the Work Time slice.
2. Implement the work-time query and save mutation with live reads/writes plus safe fallback.
3. Add the protected route and wire it from `Schedule Detail`/`Manager Home`.
4. Add focused tests, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New route under `src/app/`
- New work-time files under `src/features/work-time/`
- Updated auth-route access, schedule/home navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active manager/admin users can open the work-time route.
- Planned and actual time inputs save through the tracked `schedule_time_records` path.
- The repo verification baseline still passes.

Known gaps:

- Live writes still depend on applying the shared scheduling migration to the real Supabase project.
- Payroll update UX beyond invalidating queries remains a follow-up.

## Done Criteria

- The app contains the first manager/admin work-time route with save/update behavior.
- `WORKLOG.md` reflects the completed slice and the next follow-up.
