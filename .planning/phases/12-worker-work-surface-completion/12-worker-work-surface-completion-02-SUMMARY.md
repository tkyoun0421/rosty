---
phase: 12-worker-work-surface-completion
plan: 02
subsystem: ui
tags: [nextjs, react, supabase, vitest, attendance, worker-ui]
requires:
  - phase: 12-worker-work-surface-completion
    provides: recruiting surface completion and worker-facing card patterns from plan 01
provides:
  - confirmed assignment read model that preserves visibility when pay rates are pending
  - confirmed shifts page with pay readiness guidance and attendance continuity
  - pay preview fallback state for missing worker rates
affects: [worker-assignments, attendance, pay-preview]
tech-stack:
  added: []
  patterns: [nullable pay preview contracts, pay-ready versus rate-pending worker states]
key-files:
  created: []
  modified:
    - src/queries/assignment/types/workerAssignmentPreview.ts
    - src/queries/assignment/dal/listConfirmedWorkerAssignments.ts
    - src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts
    - src/queries/attendance/dal/listWorkerAttendanceStatuses.ts
    - src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts
    - src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx
    - src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx
    - src/flows/worker-assignment-preview/components/PayPreviewTotalCard.tsx
    - src/flows/worker-assignment-preview/utils/workerAssignmentPreview.ts
    - src/flows/worker-assignment-preview/components/ConfirmedAssignmentList.tsx
key-decisions:
  - Preserve confirmed assignment visibility even when the worker rate is missing, rather than hiding the entire surface.
  - Keep attendance state derived only from assignment identity and timing so check-in survives pay-readiness gaps.
patterns-established:
  - Worker pay preview DTOs should separate `payStatus` from nullable pay fields instead of overloading empty lists.
  - Confirmed-work surfaces should show explicit pay-unavailable guidance while keeping attendance actions visible.
requirements-completed: [WORKUI-02, WORKUI-03]
duration: 11 min
completed: 2026-04-07
---

# Phase 12 Plan 02: Confirmed Work Surface Summary

**Confirmed-shift hub that preserves attendance visibility when pay rates are pending and explains pay readiness**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-07T19:04:00+09:00
- **Completed:** 2026-04-07T19:15:05+09:00
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Changed the confirmed assignment query so missing worker rates now produce `missing_worker_rate` items instead of hiding real work.
- Rebuilt `/worker/assignments` into a confirmed-work surface with explicit empty, ready, and pay-unavailable states.
- Preserved attendance status generation and `Check in now` availability even when pay data is still pending.

## Task Commits

1. **Task 1: Preserve confirmed-work visibility when pay data is unavailable** - `627b558` (feat)
2. **Task 2: Rebuild the confirmed-work surface, pay summary, and state guidance** - `627b558` (feat)

## Files Created/Modified

- `src/queries/assignment/types/workerAssignmentPreview.ts` - introduces `payStatus` and nullable pay fields.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` - keeps confirmed assignments visible without worker rates.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` - verifies ready and missing-rate branches.
- `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts` - keeps attendance derived from assignment identity and timing only.
- `src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts` - verifies attendance generation when pay data is unavailable.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` - rebuilds the confirmed-work page with empty and pay-pending states.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` - covers ready, empty, pay-pending, and attendance interaction branches.
- `src/flows/worker-assignment-preview/components/PayPreviewTotalCard.tsx` - adds the expected-pay unavailable fallback state.
- `src/flows/worker-assignment-preview/utils/workerAssignmentPreview.ts` - returns `Pending admin rate` when pay values are null.
- `src/flows/worker-assignment-preview/components/ConfirmedAssignmentList.tsx` - keeps the legacy preview component aligned with the new nullable pay contract.

## Decisions Made

- Modeled pay readiness as `ready` versus `missing_worker_rate` so UI branches are explicit and testable.
- Added a dedicated pay-unavailable card instead of collapsing the state into the total-pay card only.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kept the legacy confirmed assignment preview component type-safe**
- **Found during:** Task 2 (confirmed-work surface rebuild)
- **Issue:** The older `ConfirmedAssignmentList` component still referenced non-null pay fields and would drift out of contract with the new DTO shape.
- **Fix:** Updated the component to reuse the new schedule and breakdown helpers with pay-status-aware copy.
- **Files modified:** `src/flows/worker-assignment-preview/components/ConfirmedAssignmentList.tsx`
- **Verification:** Phase 12 worker surface Vitest suite passed after the DTO change.
- **Committed in:** `627b558`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep. The fix only preserved compile safety around the new nullable pay contract.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Worker recruiting and confirmed-work surfaces are now both present, so Phase 12 can be closed at the milestone level.
- Remaining validation should focus on manual browser UAT rather than missing implementation scope.

---
*Phase: 12-worker-work-surface-completion*
*Completed: 2026-04-07*
