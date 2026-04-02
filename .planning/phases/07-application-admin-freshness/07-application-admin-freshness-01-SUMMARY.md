---
phase: 07-application-admin-freshness
plan: 01
subsystem: testing
tags: [vitest, nextjs, cache, application, regression]
requires:
  - phase: 05-operations-dashboard
    provides: dashboard cache-tag invalidation pattern used by adjacent mutations
provides:
  - failing-first regression coverage for worker-application admin freshness
  - duplicate/no-op regression coverage for submitScheduleApplication cache churn
affects: [phase-07-plan-02, admin-schedule-detail, operations-dashboard]
tech-stack:
  added: []
  patterns: [server-action cache invalidation regression tests, duplicate no-op cache guard coverage]
key-files:
  created: [src/mutations/application/actions/submitScheduleApplication.test.ts]
  modified: []
key-decisions:
  - "Keep Plan 01 as a pure RED gate so the missing admin-detail and dashboard invalidation is executable before implementation."
  - "Assert exact cache tag strings in the action test rather than inferring freshness through unrelated DAL coverage."
patterns-established:
  - "Worker submit wrappers should return the underlying domain action result so tests can distinguish write vs no-op paths."
  - "Freshness regressions should prove both positive tag invalidation and duplicate-path non-invalidation in the same suite."
requirements-completed: []  # Wave 0 coverage only; APPL-02, APPL-03, and DASH-02 remain open until Plan 02 lands.
duration: 4min
completed: 2026-04-03
---

# Phase 07 Plan 01: Application Admin Freshness Summary

**Failing-first Vitest coverage now proves worker application submits must refresh admin schedule detail and dashboard caches while duplicate submits stay side-effect free**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T05:56:00+09:00
- **Completed:** 2026-04-03T05:59:58+09:00
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added a colocated Wave 0 regression file for `submitScheduleApplication`.
- Encoded the exact admin-detail and dashboard cache-tag expectations for a successful application submit.
- Verified the current implementation fails because it does not return the underlying result and does not distinguish write vs duplicate paths.

## Task Commits

Each task was committed atomically:

1. **Task 1: Write the failing-first worker-application freshness regression file** - `369066a` (test)

## Files Created/Modified
- `src/mutations/application/actions/submitScheduleApplication.test.ts` - Failing-first freshness regression coverage for success-path invalidation and duplicate no-op behavior.

## Decisions Made
- Keep this plan scoped to RED-only regression creation so Plan 02 can implement the freshness fix against an executable failure.
- Assert the exact schedule-detail and dashboard tag names in the action test to keep the phase tightly scoped to cache invalidation behavior.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts` failed in the expected RED state because `submitScheduleApplication` returns `undefined` and still treats duplicate submissions like cache-invalidating writes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02 can now update `submitScheduleApplication` against a concrete regression that covers worker, admin-detail, and dashboard freshness together.
- APPL-02, APPL-03, and DASH-02 are not complete yet; this plan only established the failing harness.

## Self-Check: PASSED

---
*Phase: 07-application-admin-freshness*
*Completed: 2026-04-03*
