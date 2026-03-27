# Work Log

## Purpose

Track what was completed, what was in progress at the end of a session, and what should be resumed next.

## Update Rules

- Add a new entry at the top when a meaningful session ends.
- Update `docs/prd.md` together with this log whenever feature status changes.
- Record the last in-progress task and the immediate next task, not only completed items.
- Include the related commit hash when work is committed. Use `uncommitted` until a commit exists.

## Current Handoff

### 2026-03-27

- Completed
  - Provider wiring moved under `src/app/_providers` and `AppProviders` was renamed to `QueryClientProvider`.
  - Schedule slices were realigned from `models/dto/dal/form` to `types/schemas/dal`.
  - Development rules and contract tests were updated to lock the new folder taxonomy.
- Last In Progress
  - Structural cleanup is green and the codebase is ready to resume Release 1 feature work on top of the new taxonomy.
- Next Up
  - Implement admin request review with approval and rejection.
  - Reflect admin decisions back into the employee request status flow.
  - Start the assigned schedule confirmation view after the approval loop is stable.
- Blockers / Notes
  - Schedule persistence still uses an in-memory dev API and must later move to Supabase.
  - Real-time updates and request filter/sort are still pending.
- Related Commit
  - `uncommitted`

### 2026-03-27

- Completed
  - Employee schedule request form was added at `/schedule`.
  - Employee request list and status view were added with React Query and a mock-backed dev API.
  - Date validation, duplicate slot rejection, and role selection were added for the first Release 1 slice.
- Last In Progress
  - The employee-side schedule MVP loop is green with mock data and ready for the admin review slice.
- Next Up
  - Implement admin request review with approval and rejection.
  - Reflect admin decisions back into the employee request status flow.
  - Start the assigned schedule confirmation view after the approval loop is stable.
- Blockers / Notes
  - Schedule persistence still uses an in-memory dev API and must later move to Supabase.
  - Real-time updates and request filter/sort are still pending.
- Related Commit
  - `uncommitted`