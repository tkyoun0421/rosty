---
phase: 04-attendance-check-in
plan: 03
subsystem: ui
tags: [attendance, admin, react, nextjs, supabase, vitest]
requires:
  - phase: 04-01
    provides: attendance window, lateness cutoff, and attendance persistence contract
provides:
  - schedule-centric admin attendance DTO with derived summary counts
  - admin attendance DAL that joins confirmed assignments to attendance rows
  - schedule detail attendance panel inside the existing admin route
affects: [04-02, 05-operations-dashboard]
tech-stack:
  added: []
  patterns: [server-side attendance status mapping, schedule-detail co-loading for admin review]
key-files:
  created:
    - src/queries/attendance/types/adminScheduleAttendanceDetail.ts
    - src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts
    - src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts
    - src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx
  modified:
    - src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx
    - src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx
key-decisions:
  - Keep admin attendance review inside `/admin/schedules/[scheduleId]` and load it alongside assignment detail.
  - Derive checked-in, late, not-checked-in, and not-open-yet states in the query layer so React stays render-only.
patterns-established:
  - Query slices return render-ready admin attendance summaries plus per-worker statuses.
  - Admin schedule detail pages can compose multiple schedule-centric reads in parallel without introducing new routes.
requirements-completed: [ATTD-03]
duration: 12min
completed: 2026-03-31
---

# Phase 04 Plan 03: Admin Attendance Review Summary

**Schedule-detail admin attendance review with precomputed lateness, window state, and worker-by-worker status rows**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-31T11:25:49Z
- **Completed:** 2026-03-31T11:37:49Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added a schedule-centric admin attendance DTO and DAL that start from confirmed assignments and include missing attendance rows explicitly.
- Derived `Checked in`, `Late`, `Not checked in`, and `Not open yet` before the page render, including schedule-level summary counts.
- Extended the existing admin schedule detail flow with an in-place attendance review panel and updated tests for the combined experience.

## Task Commits

No task commits were created. The user explicitly required no commit or push for this execution.

## Files Created/Modified
- `src/queries/attendance/types/adminScheduleAttendanceDetail.ts` - Attendance review DTO for admin schedule detail.
- `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` - Schedule-centric admin attendance query with cached production path and test-time clock injection.
- `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` - Query tests covering missing rows, labels, window timing, and summary counts.
- `src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx` - Attendance summary cards and worker status list for the admin schedule detail page.
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` - Parallel loads assignment detail and attendance detail inside the existing route.
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` - Verifies attendance ordering, labels, and existing assignment interactions.

## Decisions Made
- Used the existing schedule detail route as the only admin attendance surface, matching the locked phase scope.
- Kept timing and lateness anchored to `schedules.starts_at`, with the 10:00 special-case opening and the later-start 110-minute opening rule mirrored in the read model.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced the stale Vitest `-x` flag with `vitest run` for local verification**
- **Found during:** Task 1
- **Issue:** The repository uses `vitest 3.2.4`, which rejects the `-x` flag specified in the plan.
- **Fix:** Ran `pnpm exec vitest run ...` for affected files instead of the stale flag.
- **Files modified:** None
- **Verification:** Targeted attendance and page tests passed with `vitest run`.
- **Committed in:** Not committed per user instruction.

**2. [Rule 3 - Blocking] Fell back from `apply_patch` to direct UTF-8 file writes when the edit tool failed**
- **Found during:** Task 1
- **Issue:** `apply_patch` returned a Windows sandbox refresh failure and could not edit any repo files.
- **Fix:** Wrote the affected files with .NET UTF-8 no-BOM file writes while preserving LF line endings.
- **Files modified:** src/queries/attendance/types/adminScheduleAttendanceDetail.ts, src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts, src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx, src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx, src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx
- **Verification:** Targeted tests passed and file encoding was preserved during writes.
- **Committed in:** Not committed per user instruction.

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were execution-only workarounds. The delivered behavior still matches the plan scope.

## Issues Encountered
- The generated UTC timestamps in tests needed explicit absolute-date corrections for the 10:00 +09:00 opening rule.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Admin attendance review is now available from the existing schedule detail flow.
- Phase 04 still has plan 04-02 pending in planning artifacts; this summary only covers 04-03 executed out of order.

## Self-Check: PASSED
- Summary file exists at `.planning/phases/04-attendance-check-in/04-attendance-check-in-03-SUMMARY.md`.
- Targeted verification passed with `pnpm exec vitest run src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx`.
- Commit verification intentionally skipped because commits were forbidden for this run.

---
*Phase: 04-attendance-check-in*
*Completed: 2026-03-31*