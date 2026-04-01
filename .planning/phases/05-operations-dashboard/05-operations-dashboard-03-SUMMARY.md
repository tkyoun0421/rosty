---
phase: 05-operations-dashboard
plan: 03
subsystem: api
tags: [nextjs, vitest, cache, dashboard, server-actions]
requires:
  - phase: 05-operations-dashboard
    provides: dashboard cache tags and operations dashboard read model from Plan 01
provides:
  - explicit dashboard tag revalidation from schedule writes
  - explicit dashboard tag revalidation from assignment confirmations
  - explicit dashboard tag revalidation from attendance check-in submissions
affects: [admin-dashboard, schedule-mutations, assignment-mutations, attendance-mutations]
tech-stack:
  added: []
  patterns: [server actions explicitly revalidate dashboard tags alongside domain tags, focused action tests assert tag invalidation without path fallback]
key-files:
  created:
    - src/mutations/schedule/actions/submitSchedule.test.ts
    - src/mutations/schedule/actions/submitScheduleStatus.test.ts
    - src/mutations/attendance/actions/submitAttendanceCheckIn.test.ts
  modified:
    - src/mutations/schedule/actions/submitSchedule.ts
    - src/mutations/schedule/actions/submitScheduleStatus.ts
    - src/mutations/assignment/actions/confirmScheduleAssignments.ts
    - src/mutations/assignment/actions/confirmScheduleAssignments.test.ts
    - src/mutations/attendance/actions/submitAttendanceCheckIn.ts
key-decisions:
  - Revalidate `cacheTags.dashboard.all` and `cacheTags.dashboard.adminOperations` directly from every mutation that changes dashboard-visible schedule, staffing, or attendance state.
  - Keep verification at the action level so the dashboard freshness contract stays explicit and does not rely on route-level invalidation.
patterns-established:
  - Dashboard freshness is maintained by tag-based invalidation from write actions, not `revalidatePath("/admin")`.
  - Mutation action tests assert dashboard tag calls alongside existing domain-tag invalidation.
requirements-completed: [DASH-01, DASH-02, DASH-03]
duration: 5min
completed: 2026-04-01
---

# Phase 05 Plan 03: Operations Dashboard Summary

**Dashboard cache freshness wired into schedule, staffing, and attendance server actions through explicit tag revalidation and focused mutation tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-01T09:03:00Z
- **Completed:** 2026-04-01T09:08:12Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Added dashboard tag revalidation to schedule creation and schedule status actions without introducing route-level invalidation.
- Added dashboard tag revalidation to assignment confirmation and attendance check-in actions alongside their existing domain tags.
- Added focused action tests that assert `cacheTags.dashboard.all` and `cacheTags.dashboard.adminOperations` are refreshed after these writes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Revalidate dashboard tags from schedule writes** - `0b78fe7` (feat)
2. **Task 2: Revalidate dashboard tags from assignment and attendance writes with focused test coverage** - `4c7356e` (feat)

## Files Created/Modified
- `src/mutations/schedule/actions/submitSchedule.ts` - Revalidates dashboard tags after schedule submit.
- `src/mutations/schedule/actions/submitSchedule.test.ts` - Verifies schedule submit refreshes dashboard tags without `/admin` path invalidation.
- `src/mutations/schedule/actions/submitScheduleStatus.ts` - Revalidates dashboard tags after schedule status updates.
- `src/mutations/schedule/actions/submitScheduleStatus.test.ts` - Verifies status updates refresh dashboard tags without `/admin` path invalidation.
- `src/mutations/assignment/actions/confirmScheduleAssignments.ts` - Revalidates dashboard tags when staffing confirmations change.
- `src/mutations/assignment/actions/confirmScheduleAssignments.test.ts` - Verifies assignment confirmation refreshes dashboard tags.
- `src/mutations/attendance/actions/submitAttendanceCheckIn.ts` - Revalidates dashboard tags on successful check-in submissions.
- `src/mutations/attendance/actions/submitAttendanceCheckIn.test.ts` - Verifies attendance submissions refresh dashboard tags and rejected submissions do not.

## Decisions Made
- Keep the change orchestration-only inside existing action files and avoid introducing any new shared invalidation abstraction for this narrow plan.
- Validate the freshness contract with scoped action tests rather than broader dashboard UI tests, which keeps the signal tied to the write boundary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used scoped `vitest run` instead of `pnpm test -- ...` for verification**
- **Found during:** Task 1 verification
- **Issue:** In this repo, `pnpm test -- ...` forwards a literal `--` into the Vitest script and also triggered unrelated failing suites, which blocked narrow task verification.
- **Fix:** Switched task and final verification to `pnpm exec vitest run ...` with the exact target files so the plan could be verified in isolation.
- **Files modified:** None
- **Verification:** `pnpm exec vitest run src/mutations/schedule/actions/submitSchedule.test.ts src/mutations/schedule/actions/submitScheduleStatus.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/attendance/actions/submitAttendanceCheckIn.test.ts`
- **Committed in:** Not applicable (verification workflow adjustment only)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The deviation narrowed verification to the intended files and did not change runtime scope.

## Issues Encountered
- `apply_patch` failed repeatedly in this workspace with a sandbox refresh error, so repo-tracked files were written through a UTF-8 no-BOM shell fallback to preserve progress and encoding requirements.
- A stale `.git/index.lock` blocked the Task 2 commit during parallel execution; it was removed after confirming the commit could be retried safely.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `/admin` reads now have explicit mutation-side freshness hooks across schedule, assignment, and attendance changes.
- Later dashboard work can rely on the dedicated dashboard cache tags instead of implicit overlap with schedule or attendance caches.

## Self-Check: PASSED
