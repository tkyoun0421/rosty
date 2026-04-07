---
phase: 12-worker-work-surface-completion
plan: 01
subsystem: ui
tags: [nextjs, react, supabase, vitest, worker-ui]
requires:
  - phase: 11-admin-scheduling-surface-completion
    provides: admin shell and shared schedule primitives reused by the worker surfaces
provides:
  - recruiting schedule read model with role-slot summaries
  - worker recruiting cards with readable schedule windows and inline apply state
  - guided empty state that links workers toward confirmed work
affects: [worker-schedules, schedule-applications, worker-shell]
tech-stack:
  added: []
  patterns: [server-first worker page assembly, card-based worker list surfaces]
key-files:
  created: []
  modified:
    - src/queries/schedule/dal/listRecruitingSchedules.ts
    - src/queries/schedule/dal/listRecruitingSchedules.test.ts
    - src/flows/worker-schedules/utils/formatSchedule.ts
    - src/flows/worker-schedules/components/WorkerSchedulesPage.tsx
    - src/flows/worker-schedules/components/WorkerScheduleList.tsx
    - src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx
    - src/mutations/application/components/ApplyToScheduleButton.tsx
key-decisions:
  - Keep the existing schedule application submit wrapper and revalidation contract while refreshing only the worker-facing presentation.
  - Move role-slot summarization into the recruiting query so the page does not guess card content client-side.
patterns-established:
  - Worker recruiting surfaces should merge schedule and current-user application data on the server before rendering.
  - Worker list UIs should use the shared Card, Badge, and Button primitives plus explicit next-step empty states.
requirements-completed: [WORKUI-01, WORKUI-03]
duration: 14 min
completed: 2026-04-07
---

# Phase 12 Plan 01: Worker Recruiting Surface Summary

**Worker recruiting cards with role-slot summaries, readable schedule windows, and inline application state**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-07T19:00:00+09:00
- **Completed:** 2026-04-07T19:14:34+09:00
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Expanded the recruiting read model so worker schedule cards receive role-slot summaries directly from Supabase.
- Rebuilt `/worker/schedules` into a product-grade card surface with explicit apply/applied state and recruiting copy.
- Added a clear empty state that routes workers to confirmed work instead of leaving the surface blank.

## Task Commits

1. **Task 1: Expand the recruiting read model for card-ready worker summaries** - `6596f19` (feat)
2. **Task 2: Rebuild the worker recruiting page and inline apply presentation** - `6596f19` (feat)

## Files Created/Modified

- `src/queries/schedule/dal/listRecruitingSchedules.ts` - joins role slots into the worker recruiting DTO.
- `src/queries/schedule/dal/listRecruitingSchedules.test.ts` - locks the select clause and role-slot mapping.
- `src/flows/worker-schedules/utils/formatSchedule.ts` - formats readable schedule windows and role summaries.
- `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` - rebuilds the worker recruiting route shell.
- `src/flows/worker-schedules/components/WorkerScheduleList.tsx` - renders recruiting cards and the guided empty state.
- `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` - verifies headings, schedule windows, role summaries, and empty CTA behavior.
- `src/mutations/application/components/ApplyToScheduleButton.tsx` - aligns apply/applied labels with shared button styling.

## Decisions Made

- Kept the existing `submitScheduleApplication` action path so the write-side invalidation contract remains unchanged.
- Standardized worker recruiting time labels on `en-US` formatting with `Asia/Seoul` timezone for deterministic card copy.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cast the server action for React form compatibility**
- **Found during:** Task 2 (inline apply presentation)
- **Issue:** `submitScheduleApplication` intentionally returns a result object for tests, which is stricter than the form action type signature.
- **Fix:** Kept the existing action path and added a narrow cast at the form boundary.
- **Files modified:** `src/mutations/application/components/ApplyToScheduleButton.tsx`
- **Verification:** Phase 12 worker surface Vitest suite passed.
- **Committed in:** `6596f19`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep. The fix preserved the planned action path while restoring type compatibility.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The recruiting surface is complete and ready to hand off into the confirmed-work execution plan.
- `/worker/assignments` can now link back to a stable recruiting destination for empty states.

---
*Phase: 12-worker-work-surface-completion*
*Completed: 2026-04-07*
