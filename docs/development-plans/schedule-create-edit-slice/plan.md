# Schedule Create Edit Slice

## Summary

Add the first manager/admin `Schedule Create/Edit` workflow so operators can create a schedule from the tracked slot preset baseline, adjust slot configuration, and save updates while the schedule remains editable.

## Scope

- Add a protected `Schedule Create/Edit` route for active manager/admin users.
- Seed the local fallback with tracked slot presets and reuse them when creating a new schedule.
- Allow creating a new collecting/open schedule and editing an existing collecting schedule.
- Save `schedules` plus `schedule_slots` together through the current tracked schema or local fallback.

Out of scope:

- Repeating schedule generation
- External calendar import
- Assignment confirmation or work-time editing inside the same screen
- Rich conflict detection beyond the current validation rules

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the schedule create/edit slice.
2. Add the create/edit model plus live/fallback save path using the tracked schedule tables.
3. Add the protected route and wire entry points from `Manager Home` and editable `Schedule Detail`.
4. Add focused tests, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New route under `src/app/`
- New schedule create/edit files under `src/features/schedules/`
- Updated schedule fallback state, home/detail navigation, docs, and `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active manager/admin users can open the create/edit route.
- Creating or updating a schedule saves the schedule row and its slot rows together.
- Validation blocks past dates, zero package count, and schedules with no enabled slots.
- The repo verification baseline still passes.

Known gaps:

- Live writes still depend on applying the shared scheduling migration to the real Supabase project.
- Slot preset admin management remains a separate follow-up.

## Done Criteria

- The app contains the first manager/admin schedule create/edit route.
- The save path works for both a new schedule and an editable collecting schedule.
- `WORKLOG.md` reflects the completed slice and the next follow-up.
