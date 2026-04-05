---
phase: 08-pay-preview-freshness
plan: 02
subsystem: api
tags: [nextjs, cache, worker-rate, pay-preview, vitest]
requires:
  - phase: 07-application-admin-freshness
    provides: submit-wrapper cache invalidation pattern for freshness fixes
  - phase: 03-assignment-and-pay-preview
    provides: worker pay-preview query and downstream preview flow
provides:
  - success-gated worker pay-preview cache invalidation after admin rate writes
  - dedicated pay-preview cache tag wiring on the worker confirmed-assignment read
  - passing freshness regression and worker preview smoke coverage
affects: [phase-09, worker-assignment-preview, admin-worker-rates]
tech-stack:
  added: []
  patterns: [success-gated revalidateTag orchestration, dedicated worker pay-preview cache tags]
key-files:
  created: []
  modified:
    [
      src/mutations/worker-rate/actions/submitWorkerRate.ts,
      src/mutations/worker-rate/actions/submitWorkerRate.test.ts,
      src/queries/assignment/dal/listConfirmedWorkerAssignments.ts,
      src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts,
    ]
key-decisions:
  - "Revalidate only the affected worker's pay-preview tag after a successful rate write instead of widening invalidation to broader assignment namespaces."
  - "Keep the existing worker preview page contract unchanged and make the dedicated pay-preview tag meaningful at the cached query boundary."
patterns-established:
  - "Admin write wrappers should own cache invalidation while DAL write helpers stay focused on persistence and authorization."
  - "Dedicated freshness tags should be attached to the exact cached read they are meant to refresh."
requirements-completed: [PAY-01, PAY-02, PAY-04]
duration: 4min
completed: 2026-04-05
---

# Phase 08 Plan 02: Pay Preview Freshness Summary

**Admin worker-rate writes now refresh the affected worker pay-preview cache through a dedicated tag, and the existing worker preview flow remains green**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-05T19:08:10+09:00
- **Completed:** 2026-04-05T19:12:23+09:00
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Updated `submitWorkerRate` so successful rate writes revalidate only `assignments:worker-pay-preview:<userId>`.
- Wired `listConfirmedWorkerAssignments` to subscribe to the dedicated worker pay-preview cache tag while preserving its existing VITEST short-circuit and return shape.
- Passed the freshness regression bundle and the full Vitest suite without changing the worker preview page contract.

## Task Commits

No git commits were created in this session. This runtime requires an explicit user request before committing, so plan progress was recorded without task commits.

## Files Created/Modified
- `src/mutations/worker-rate/actions/submitWorkerRate.ts` - Success-gated pay-preview cache invalidation after admin worker-rate writes.
- `src/mutations/worker-rate/actions/submitWorkerRate.test.ts` - Locks the submit-wrapper invalidation and failure-path non-invalidation contract.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` - Adds the dedicated worker pay-preview tag to the cached read contract.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` - Verifies the exact three-tag cache contract in the cached branch.

## Decisions Made
- Keep invalidation in `submitWorkerRate.ts` rather than moving cache logic into `upsertWorkerRate.ts`.
- Revalidate only `workerPayPreview(userId)` and keep the worker preview page untouched so the freshness fix stays narrowly scoped.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used direct Vitest invocation for targeted verification**
- **Found during:** Task 1 and Task 2 verification
- **Issue:** The repo's `pnpm test -- <file>` wrapper did not reliably isolate the requested file list during targeted checks.
- **Fix:** Used `pnpm exec vitest run <target files>` for plan-level verification, then ran the full suite once before phase verification.
- **Files modified:** None
- **Verification:** `pnpm exec vitest run src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` and `pnpm exec vitest run`
- **Committed in:** Not committed in this session

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Verification stayed aligned to the phase goal and ended with a clean full-suite pass.

## Issues Encountered
- None in implementation. The only execution blocker was the repo's targeted test wrapper behavior, which was bypassed with direct Vitest invocation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 08 is ready for milestone-level follow-up and Phase 09 verification evidence reconciliation.
- Manual UAT still remains for the live admin-write to worker-preview freshness cycle and unrelated-worker scoping check.

## Self-Check: PASSED

---
*Phase: 08-pay-preview-freshness*
*Completed: 2026-04-05*
