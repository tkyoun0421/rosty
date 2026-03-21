# Assignment Exception Slice

## Summary

Add the explicit duplicate-assignee exception path to `Assignment Workspace` so operators must confirm before assigning the same employee to multiple slots on one schedule.

## Scope

- Extend assignment workspace reads and writes to carry `is_exception_case`.
- Add explicit duplicate-assignee confirmation inside `Assignment Workspace`.
- Keep the existing schedule-level confirm flow unchanged.
- Update the current IA/worklog references for the richer staffing behavior.

Out of scope:

- Automatic duplicate recommendations
- Batch exception approval
- A dedicated exception review queue
- Assignment notifications for exception saves

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the assignment exception slice.
2. Extend assignment draft save/read paths and add focused regression tests.
3. Add explicit duplicate-assignee confirmation UI to `Assignment Workspace`.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- Updated assignment workspace API/model files under `src/features/assignments/`
- New focused save-assignment draft test
- Updated `Assignment Workspace` UI and related archive notes

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Operators can still save normal draft assignments directly.
- Duplicate same-schedule assignees require explicit confirmation.
- Exception saves persist `is_exception_case = true`.

Known gaps:

- Live behavior still depends on the shared scheduling and confirm migrations being applied to the real Supabase project.

## Done Criteria

- `Assignment Workspace` exposes explicit duplicate-assignee confirmation.
- Save/read paths preserve `is_exception_case`.
- The slice is committed and pushed after verification.
