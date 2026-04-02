---
phase: 07-application-admin-freshness
plan: 02
subsystem: api
tags: [nextjs, server-actions, cache, vitest, applications]
requires:
  - phase: 07-application-admin-freshness-plan-01
    provides: failing-first regression coverage for submitScheduleApplication freshness behavior
  - phase: 05-operations-dashboard
    provides: dashboard cache-tag contract reused by the worker application submit wrapper
provides:
  - success-gated admin schedule-detail freshness after worker application submit
  - success-gated admin dashboard freshness after worker application submit
  - duplicate/no-op submit behavior without unnecessary cache invalidation
affects: [phase-08, admin-schedule-detail, operations-dashboard]
tech-stack:
  added: []
  patterns: [success-gated revalidateTag orchestration, schedule-scoped admin detail invalidation]
key-files:
  created: []
  modified: [src/mutations/application/actions/submitScheduleApplication.ts]
key-decisions:
  - "Keep the freshness fix in the submit wrapper instead of moving invalidation into the domain write action."
  - "Revalidate only the schedule-scoped assignment detail tag, not assignments.all, to keep admin freshness narrowly targeted."
patterns-established:
  - "Server actions that wrap writes should parse once, return the underlying result, and revalidate tags only on real writes."
  - "Worker-facing cache invalidation can be extended with admin tags without widening to route-level revalidation."
requirements-completed: [APPL-02, APPL-03, DASH-02]
duration: 5min
completed: 2026-04-03
---

# Phase 07 Plan 02: Application Admin Freshness Summary

**Worker application submits now return explicit write/no-op results and refresh the affected admin schedule-detail and operations dashboard caches only after real writes**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-03T06:00:30+09:00
- **Completed:** 2026-04-03T06:04:33+09:00
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Updated `submitScheduleApplication` to parse once, return the underlying result, and gate revalidation on `result.status === "applied"`.
- Added the missing admin freshness invalidation for `assignments:detail:<scheduleId>`, `dashboard`, and `dashboard:admin-operations`.
- Verified the action regression and the existing admin detail/dashboard read-model tests pass together.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement success-gated admin freshness invalidation in the submit wrapper** - `e94a847` (feat)

## Files Created/Modified
- `src/mutations/application/actions/submitScheduleApplication.ts` - Success-gated worker and admin cache invalidation for application submits.

## Decisions Made
- Keep cache invalidation in the submit wrapper so `createScheduleApplication` remains focused on domain write semantics.
- Revalidate `cacheTags.assignments.detail(parsed.scheduleId)` rather than `cacheTags.assignments.all` to match the phase's narrow admin freshness scope.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `pnpm test -- ...` routes through the package test script and exercised the broader Vitest suite, but the required regression targets still passed and the extra coverage stayed green.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 07's worker-apply freshness gap is closed for both admin schedule detail and the operations dashboard.
- Phase 08 can reuse this success-gated invalidation pattern for pay-preview freshness after admin rate writes.

## Self-Check: PASSED

---
*Phase: 07-application-admin-freshness*
*Completed: 2026-04-03*
