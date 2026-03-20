# Availability Submission Slice

## Summary

Add the first employee availability-submission workflow so active employees can open a schedule detail screen, review their current response state, and submit or update an `available`/`unavailable` response while the collection is open.

## Scope

- Add the tracked `availability_status` and `availability_submissions` schema.
- Add a limited employee RPC for submitting or updating the current schedule availability response.
- Show the current employee response state in `Schedule Detail` and allow updates when the collection is open.
- Keep the first slice employee-only and read-only for manager/admin users.

Out of scope:

- Availability overview for manager/admin
- Batch response UX
- Time-based automatic collection closing
- Schedule creation/editing or assignment workspace changes

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active task points to the availability-submission slice.
2. Add the tracked availability schema and limited employee response RPC.
3. Add the employee availability query/mutation and wire the controls into `Schedule Detail`.
4. Add focused tests, rerun verification, and refresh `WORKLOG.md`.

## Data / Interface Impact

- New migration under `supabase/migrations/`
- New availability files under `src/features/availability/`
- Updated schedule detail UI and docs
- Updated `WORKLOG.md`

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Active employees can submit or update availability while the schedule collection is open.
- Locked/cancelled schedules block new availability writes.
- The repo verification baseline still passes.

Known gaps:

- Manager/admin availability overview remains a follow-up.
- Live availability writes still depend on applying the new migration to the real Supabase project.

## Done Criteria

- The app contains the first employee availability response flow in `Schedule Detail`.
- Availability writes use a limited RPC path.
- `WORKLOG.md` reflects the completed slice and the next follow-up.
