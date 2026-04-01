---
phase: 05-operations-dashboard
plan: 01
subsystem: api
tags: [nextjs, supabase, postgres, vitest, dashboard, cache]
requires:
  - phase: 04-attendance-check-in
    provides: attendance open-window timing and schedule-centric attendance summary semantics
provides:
  - explicit operations dashboard card and anomaly contracts
  - pure dashboard window, grouping, and anomaly helpers
  - cached admin operations dashboard DAL over schedules, staffing, applications, and attendance
affects: [admin-dashboard, schedule-detail, cache-invalidation]
tech-stack:
  added: []
  patterns: [cached raw-row dashboard reads with request-time anomaly mapping, confirmed-only staffing counts for dashboard cards]
key-files:
  created:
    - src/queries/operations-dashboard/types/operationsDashboard.ts
    - src/queries/operations-dashboard/utils/operationsDashboard.ts
    - src/queries/operations-dashboard/utils/operationsDashboard.test.ts
    - src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.ts
    - src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts
  modified:
    - src/shared/config/cacheTags.ts
key-decisions:
  - Keep dashboard anomaly classification request-time while caching only the raw schedule rows for the current dashboard window.
  - Count only confirmed assignments toward staffed coverage so draft rows cannot clear an unfilled slots anomaly.
patterns-established:
  - Dashboard read models aggregate schedules, role slots, applications, assignments, and attendance in one DAL query.
  - Dashboard cards receive render-ready schedule labels from query utilities instead of recomputing date and time strings in JSX.
requirements-completed: [DASH-02, DASH-03]
duration: 16min
completed: 2026-04-01
---

# Phase 05 Plan 01: Operations Dashboard Summary

**Cached admin schedule-card read model with explicit anomaly priority, today/upcoming grouping, and render-ready local time labels**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-01T08:43:00Z
- **Completed:** 2026-04-01T08:58:37Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Defined `OperationsDashboardScheduleCard`, section keys, and anomaly unions for the Phase 05 dashboard contract.
- Added pure dashboard helpers for local-window boundaries, section grouping, display-label derivation, and anomaly ordering.
- Built one cached admin DAL that reads schedules, slots, applications, assignments, and attendance in a single query and maps `today` and `upcoming` cards.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define the dashboard card contract and pure anomaly helpers** - `8996144` (feat)
2. **Task 2: Build the aggregated admin dashboard DAL and cache tags** - `c915f11` (feat)

## Files Created/Modified
- `src/queries/operations-dashboard/types/operationsDashboard.ts` - Dashboard card, section, and anomaly contracts.
- `src/queries/operations-dashboard/utils/operationsDashboard.ts` - Dashboard window, display, grouping, and anomaly helpers.
- `src/queries/operations-dashboard/utils/operationsDashboard.test.ts` - Utility coverage for anomaly priority, timing, window, and grouping.
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.ts` - Cached admin dashboard DAL that maps one schedule-card summary per schedule.
- `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` - DAL coverage for one-query aggregation, confirmed-only staffing, and dashboard cache tags.
- `src/shared/config/cacheTags.ts` - Dedicated dashboard cache tags for later `/admin` invalidation.

## Decisions Made
- Cached only the dashboard raw query result for the active time window and computed anomaly labels after the cache read so open-window transitions do not drift.
- Reused the Phase 4 attendance timing rule directly in the dashboard helper layer to keep missing-check-in timing aligned with the schedule attendance detail view.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Late arrivals were double-counted as missing check-ins**
- **Found during:** Task 2 (Build the aggregated admin dashboard DAL and cache tags)
- **Issue:** The initial helper logic subtracted only on-time check-ins from confirmed staffing, which caused late workers to still inflate `missing_check_ins` counts.
- **Fix:** Updated anomaly math and tests so missing check-ins subtract both checked-in and late arrivals.
- **Files modified:** `src/queries/operations-dashboard/utils/operationsDashboard.ts`, `src/queries/operations-dashboard/utils/operationsDashboard.test.ts`
- **Verification:** `pnpm test -- src/queries/operations-dashboard/utils/operationsDashboard.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts`
- **Committed in:** `c915f11` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The auto-fix was necessary for correct anomaly semantics and did not expand scope.

## Issues Encountered
- `apply_patch` repeatedly failed when creating one of the new dashboard files in this workspace, so the affected files were written through a UTF-8-safe shell fallback and then normalized back to LF line endings before commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 05 now has a stable schedule-card query contract for `/admin` UI wiring in Plan 02.
- Later mutation plans can revalidate `cacheTags.dashboard.*` without needing to infer the dashboard read path.

## Self-Check: PASSED

---
*Phase: 05-operations-dashboard*
*Completed: 2026-04-01*