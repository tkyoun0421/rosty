# My Assignments Slice

## Summary

Add the first employee-only `My Assignments` workflow so active employees can review their own confirmed assignment schedules from a dedicated route, grouped by event and split into upcoming and past sections.

## Scope

- Add a protected `My Assignments` route for active employees.
- Reuse the tracked scheduling read schema and add a query path with safe seeded fallback until the payroll or scheduling migration is applied remotely.
- Group multiple slot assignments in the same schedule into one employee-facing schedule card with combined positions.
- Split the employee view into upcoming and past schedules.

Out of scope:

- `Assignment Detail`
- Cancellation request mutations
- Manager or admin assignment workspace features
- Notifications or search integration

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the `My Assignments` slice.
2. Implement the employee assignments query and grouping model with live Supabase reads plus seeded fallback.
3. Add the `My Assignments` route and screen plus an employee home entry point.
4. Add focused regression coverage, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New employee route under `src/app/`
- New assignments read files under `src/features/assignments/`
- Updated auth-route access rules and employee home navigation
- Updated docs and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active employees can open the new `My Assignments` route.
- Same-schedule multi-position assignments are grouped into one schedule card.
- Upcoming and past grouping is deterministic and the repo verification baseline still passes.

Known gaps:

- The route still needs the payroll or scheduling read migration applied to the real Supabase project before it can stop using the seeded fallback there.

## Done Criteria

- The app contains an employee-only `My Assignments` route backed by the tracked scheduling read schema or safe fallback.
- Grouping and route access behavior are protected by focused tests.
- `WORKLOG.md` reflects the completed `My Assignments` slice and the next follow-up.
