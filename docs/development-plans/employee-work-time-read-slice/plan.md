# Employee Work Time Read Slice

## Summary

Expose the current schedule-level work-time record as a read-only section inside `Assignment Detail` for employees.

## Scope

- Reuse the existing `schedule_time_records` read path.
- Add display helpers for read-only work-time status and nullable timestamps.
- Show the schedule-level planned/actual work-time snapshot inside `Assignment Detail`.
- Refresh IA/worklog archive references.

Out of scope:

- Employee edits to work time
- A dedicated employee work-time route
- People-level time records
- Completion/cancellation actions for employees

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the employee work-time read slice.
2. Add display helpers and focused regression coverage for read-only work-time output.
3. Wire the work-time snapshot into `Assignment Detail`.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated work-time model helpers under `src/features/work-time/model/`
- Updated employee `Assignment Detail` UI under `src/features/assignments/ui/`
- Updated IA/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Employees can view planned/actual schedule-level work time from `Assignment Detail`.
- Missing work time still renders a clear read-only empty state.
- Employee permissions remain read-only.

Known gaps:

- Live behavior still depends on the shared scheduling schema being applied to the real Supabase project.

## Done Criteria

- `Assignment Detail` shows the current read-only work-time snapshot.
- The slice is committed and pushed after verification.
