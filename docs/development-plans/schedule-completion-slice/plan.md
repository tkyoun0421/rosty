# Schedule Completion Slice

## Summary

Add the first manager/admin action for moving an `assigned` schedule into `completed` once actual time is recorded.

## Scope

- Add a limited schedule-completion RPC that closes the schedule and its confirmed assignments together.
- Reuse the existing `Work Time` screen as the operator entry point.
- Add seed fallback behavior so local snapshots also move schedule and assignment status together.
- Refresh IA/worklog archive references.

Out of scope:

- Schedule cancellation closeout rules
- People-level time records
- Automatic payroll closeout
- Completion notifications

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the schedule-completion slice.
2. Add the limited completion RPC, completion API, and focused regression coverage.
3. Wire the completion action into `Work Time` and invalidate the linked schedule, assignment, and payroll reads.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- New migration under `supabase/migrations/`
- New work-time completion API under `src/features/work-time/api/`
- Expanded `Work Time` UI and seed fallback
- Updated IA/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Assigned schedules can be marked completed only after actual time is present.
- Pending cancellation requests block completion.
- Completing a schedule moves confirmed assignments to completed and refreshes linked reads.

Known gaps:

- Live behavior still depends on applying the new completion RPC migration to the real Supabase project.

## Done Criteria

- The app contains the first limited schedule-completion path.
- Completion closes the schedule and linked confirmed assignments together.
- The slice is committed and pushed after verification.
