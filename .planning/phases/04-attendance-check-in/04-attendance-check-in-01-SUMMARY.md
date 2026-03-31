---
phase: 04-attendance-check-in
plan: 01
subsystem: api
tags: [attendance, supabase, postgres, rls, vitest, nextjs]
requires:
  - phase: 03-assignment-and-pay-preview
    provides: confirmed schedule assignments and worker ownership context
provides:
  - attendance_check_ins persistence with one-shot uniqueness and RLS
  - env-backed single-venue attendance config and server-side timing/geofence validation
  - worker-authenticated attendance submission actions with stable result codes and cache invalidation
affects: [04-02 worker attendance ui, 04-03 admin attendance review, attendance]
tech-stack:
  added: []
  patterns: [server-side attendance validation before insert, tag-based attendance invalidation, assignment-owned attendance writes]
key-files:
  created:
    - supabase/migrations/20260403_phase4_attendance_check_in.sql
    - src/shared/config/attendance.ts
    - src/mutations/attendance/schemas/attendanceCheckIn.ts
    - src/mutations/attendance/utils/calculateAttendanceWindow.ts
    - src/mutations/attendance/utils/calculateDistanceMeters.ts
    - src/mutations/attendance/dal/attendanceDal.ts
    - src/mutations/attendance/actions/createAttendanceCheckIn.ts
    - src/mutations/attendance/actions/submitAttendanceCheckIn.ts
  modified:
    - src/shared/config/cacheTags.ts
    - src/mutations/attendance/schemas/attendanceCheckIn.test.ts
    - src/mutations/attendance/dal/attendanceDal.test.ts
    - src/mutations/attendance/actions/createAttendanceCheckIn.test.ts
key-decisions:
  - "Attendance window logic stays anchored to schedules.starts_at, with a special 08:20 open time for 10:00 starts and a 110-minute lead for 11:00 or later starts."
  - "Attendance writes snapshot submitted coordinates, computed distance, allowed radius, and lateness at insert time so later worker and admin reads do not need to recompute them."
patterns-established:
  - "Pattern 1: worker attendance submission authenticates in the action layer and maps DAL errors to stable result codes."
  - "Pattern 2: confirmed-assignment ownership is checked before attendance insert and duplicates collapse to a stable ATTENDANCE_DUPLICATE outcome."
requirements-completed: [ATTD-01, ATTD-02]
duration: 10min
completed: 2026-03-31
---

# Phase 4 Plan 1: Attendance Backend Summary

**One-shot attendance check-ins backed by Supabase RLS, server-side timing and geofence validation, and stable worker submit result codes**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-31T11:15:09.875Z
- **Completed:** 2026-03-31T11:25:05.6241646Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Added `attendance_check_ins` with uniqueness, worker/admin read indexes, and worker-owned insert/select RLS.
- Added the attendance mutation slice with schema parsing, timing math, distance math, DAL persistence, and stable error mapping.
- Added worker submit orchestration that invalidates attendance plus worker-confirmed assignment cache tags on success.

## Task Commits

No task commits were created. The user explicitly required no commit or push for this execution.

## Files Created/Modified
- `supabase/migrations/20260403_phase4_attendance_check_in.sql` - Attendance persistence contract, one-shot uniqueness, indexes, and RLS.
- `src/shared/config/attendance.ts` - Env-backed single-venue attendance configuration.
- `src/shared/config/cacheTags.ts` - Attendance cache tags for schedule and worker invalidation.
- `src/mutations/attendance/schemas/attendanceCheckIn.ts` - Attendance input parsing for object and `FormData` submits.
- `src/mutations/attendance/utils/calculateAttendanceWindow.ts` - First-ceremony attendance opening window math.
- `src/mutations/attendance/utils/calculateDistanceMeters.ts` - Haversine distance calculation for venue-radius checks.
- `src/mutations/attendance/dal/attendanceDal.ts` - Confirmed-assignment lookup, validation, insert orchestration, and duplicate mapping.
- `src/mutations/attendance/actions/createAttendanceCheckIn.ts` - Worker-authenticated action returning stable result codes.
- `src/mutations/attendance/actions/submitAttendanceCheckIn.ts` - Form submit wrapper with tag invalidation.
- `src/mutations/attendance/schemas/attendanceCheckIn.test.ts` - Schema and utility coverage for parsing and timing rules.
- `src/mutations/attendance/dal/attendanceDal.test.ts` - DAL coverage for ownership, uniqueness, snapshots, early-submit, and radius rejection.
- `src/mutations/attendance/actions/createAttendanceCheckIn.test.ts` - Action coverage for auth gating, stable result mapping, and cache invalidation.

## Decisions Made
- Used `schedules.starts_at` as the canonical Phase 4 v1 time source for both attendance opening and lateness evaluation.
- Kept the backend contract backend-only: no read-model or UI wiring was added in this plan.
- Added attendance-specific cache tags instead of path invalidation so later worker and admin reads can subscribe to stable tag boundaries.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Switched to a BOM-free PowerShell file writer when `apply_patch` failed repeatedly**
- **Found during:** Task 1 and Task 2 execution
- **Issue:** The `apply_patch` tool failed with a Windows sandbox refresh error before any repo edits could be applied.
- **Fix:** Wrote the required files with a PowerShell helper using `System.IO.File::WriteAllText` and UTF-8 without BOM.
- **Files modified:** All files listed in this summary
- **Verification:** `pnpm run encoding:check`
- **Committed in:** None, per user instruction

**2. [Rule 3 - Blocking] Adjusted the Vitest verification command to match the installed CLI**
- **Found during:** Task verification
- **Issue:** The planned `pnpm exec vitest ... -x` command failed because Vitest `3.2.4` in this repo does not support `-x`.
- **Fix:** Re-ran the same scoped test files without `-x`.
- **Files modified:** None
- **Verification:** `pnpm exec vitest src/mutations/attendance/actions/createAttendanceCheckIn.test.ts src/mutations/attendance/dal/attendanceDal.test.ts src/mutations/attendance/schemas/attendanceCheckIn.test.ts`
- **Committed in:** None, per user instruction

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both deviations were execution-environment fixes only. Scope and shipped backend behavior stayed aligned with the plan.

## Issues Encountered
- `apply_patch` was unusable in this run because of a sandbox setup failure.
- The verification command embedded in the plan did not match the installed Vitest CLI.

## User Setup Required

None - no external service configuration required beyond existing environment variable management for the new attendance config keys.

## Next Phase Readiness
- Phase `04-02` can build the worker geolocation submit UI against stable result codes and attendance cache tags.
- Phase `04-03` can add admin attendance reads against the persisted location snapshot, lateness flag, and schedule-scoped indexes.

## Self-Check: PASSED
- Verified summary file creation.
- Verified all 12 planned runtime files exist.
- Verified scoped attendance Vitest suite passes.
- Verified `pnpm run encoding:check` passes.
- Commit verification intentionally skipped because the user explicitly prohibited commits for this execution.

---
*Phase: 04-attendance-check-in*
*Completed: 2026-03-31*