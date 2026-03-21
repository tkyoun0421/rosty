# Schedule Cancellation Slice

## Summary

Add the first manager/admin action for canceling `collecting` or `assigned` schedules from `Schedule Detail`.

## Scope

- Add a limited schedule-cancellation RPC that closes the schedule and cancels proposed/confirmed assignments together.
- Reuse `Schedule Detail` as the operator entry point with an inline confirmation step.
- Add seed fallback behavior so local schedule, workspace, assignment, and queue snapshots stay aligned.
- Refresh IA/worklog archive references.

Out of scope:

- Schedule-cancel notifications
- Automatic requester notifications
- Bulk schedule cancellation
- Cancel reasons or audit log UI

## Implementation Steps

1. Add this plan and update `WORKLOG.md` so the active archive points to the schedule-cancellation slice.
2. Add the limited cancellation RPC, cancellation API, and focused regression coverage.
3. Wire the cancellation action into `Schedule Detail` and invalidate linked reads.
4. Run verification, then commit/push the slice.

## Data / Interface Impact

- New migration under `supabase/migrations/`
- New schedule-cancellation API/hook under `src/features/schedules/api/`
- Expanded `Schedule Detail` operator actions and seed fallback helpers
- Updated IA/worklog archive references

## Test Plan

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Expected pass criteria:

- Collecting or assigned schedules can be cancelled from `Schedule Detail`.
- Pending cancellation requests block schedule cancellation.
- Cancelling a schedule moves linked proposed/confirmed assignments to cancelled and refreshes linked reads.

Known gaps:

- Live behavior still depends on applying the new cancellation RPC migration to the real Supabase project.

## Done Criteria

- The app contains the first limited schedule-cancellation path.
- Cancellation closes the schedule and linked assignments together.
- The slice is committed and pushed after verification.
