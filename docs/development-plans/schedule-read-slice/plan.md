# Schedule Read Slice

## Summary

Add the first shared `Schedule List` and `Schedule Detail` read workflow so active users can browse tracked schedules and open a detail screen before the later availability, work-time, or editing slices land.

## Scope

- Add a protected `Schedule List` route for active users.
- Add a protected `Schedule Detail` route keyed by schedule context.
- Use the tracked scheduling read schema when available and a safe seeded fallback until the real migrations are applied.
- Keep the shipped slice read-only.

Out of scope:

- Availability submissions
- Work-time editing
- Schedule creation/editing
- Assignment workspace actions

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the schedule read slice.
2. Implement the schedule list/detail query and model layer with live reads plus safe fallback.
3. Add the list/detail routes and home entry points for active users.
4. Add focused regression coverage, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New routes under `src/app/`
- New schedule read files under `src/features/schedules/`
- Updated auth-route access rules, home navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active users can open the new list/detail routes.
- The app uses live schedule reads when the tracked schema exists and falls back safely otherwise.
- The repo verification baseline still passes.

Known gaps:

- Availability/work-time/edit flows remain later slices.
- Live schedule reads still depend on applying the scheduling migration to the real Supabase project.

## Done Criteria

- The app contains read-only schedule list/detail routes for active users.
- Shared route access and schedule read behavior are protected by focused tests.
- `WORKLOG.md` reflects the completed slice and the next follow-up.
