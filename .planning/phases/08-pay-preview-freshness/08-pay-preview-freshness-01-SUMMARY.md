---
phase: 08-pay-preview-freshness
plan: 01
subsystem: testing
tags: [vitest, nextjs, cache, worker-rate, regression]
requires:
  - phase: 03-assignment-and-pay-preview
    provides: worker pay-preview query and expected-pay read model
  - phase: 07-application-admin-freshness
    provides: server-action cache invalidation regression pattern for freshness fixes
provides:
  - failing-first worker-rate freshness regression coverage
  - cached-query contract coverage for the worker pay-preview tag
affects: [phase-08-plan-02, worker-assignment-preview, worker-rate]
tech-stack:
  added: []
  patterns: [server-action tag invalidation regressions, unstable_cache tag contract assertions]
key-files:
  created: [src/mutations/worker-rate/actions/submitWorkerRate.test.ts]
  modified: [src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts]
key-decisions:
  - "Keep Plan 01 as a pure RED gate so the Phase 08 freshness fix lands against executable failures in both the write wrapper and cached read."
  - "Assert the exact worker pay-preview cache tag contract rather than inferring freshness through the worker page."
patterns-established:
  - "Worker-rate freshness fixes should prove both success-path invalidation and failure-path non-invalidation in the same action suite."
  - "Cached query regressions should pin the exact unstable_cache tag array before implementation widens or narrows invalidation."
requirements-completed: []  # Wave 0 coverage only; PAY-01, PAY-02, and PAY-04 remain open until Plan 02 lands.
duration: 4min
completed: 2026-04-05
---

# Phase 08 Plan 01: Pay Preview Freshness Summary

**Failing-first Vitest coverage now proves admin worker-rate writes must refresh the affected worker pay-preview cache and that the cached preview query still lacks the dedicated tag**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-05T19:04:46+09:00
- **Completed:** 2026-04-05T19:08:09+09:00
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added a colocated Wave 0 regression file for `submitWorkerRate`.
- Extended the worker pay-preview query tests with an explicit cached-branch tag contract assertion.
- Verified both regressions fail only because Phase 08 freshness wiring is still missing in production code.

## Task Commits

No git commits were created in this session. This runtime requires an explicit user request before committing, so plan progress was recorded without task commits.

## Files Created/Modified
- `src/mutations/worker-rate/actions/submitWorkerRate.test.ts` - Failing-first action regression for success-path worker pay-preview invalidation and failure-path non-invalidation.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` - Cached-query contract regression that expects the dedicated worker pay-preview tag.

## Decisions Made
- Keep this plan scoped to RED-only regression creation so Plan 02 can implement the freshness fix against concrete failing tests.
- Prove the cached-query tag contract directly instead of relying on UI tests that mock the preview read and would not expose cache wiring gaps.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Switched verification from `pnpm test -- ...` to direct Vitest invocation**
- **Found during:** Task 1 and Task 2 verification
- **Issue:** The repo's `pnpm test -- <file>` wrapper did not isolate the requested files and surfaced unrelated pre-existing failures.
- **Fix:** Used `pnpm exec vitest run <target files>` so Wave 1 verification measured only the new Phase 08 regressions.
- **Files modified:** None
- **Verification:** `pnpm exec vitest run src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts`
- **Committed in:** Not committed in this session

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Verification stayed true to the plan's intent and isolated the exact RED failures needed for Plan 02.

## Issues Encountered
- `pnpm test -- src/...` currently routes through `vitest run "--" ...` and does not constrain execution to the requested file list in this repo, so targeted verification had to use `pnpm exec vitest run`.
- The combined RED run failed in the expected state because `submitWorkerRate.ts` never calls `revalidateTag("assignments:worker-pay-preview:worker-1", "max")` and `listConfirmedWorkerAssignments.ts` still omits `cacheTags.assignments.workerPayPreview(workerUserId)` from its cached tag array.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02 can now implement the Phase 08 freshness fix against explicit failures in both the admin write wrapper and the cached worker pay-preview read.
- PAY-01, PAY-02, and PAY-04 are not complete yet; this plan only established the failing regression harness.

## Self-Check: PASSED

---
*Phase: 08-pay-preview-freshness*
*Completed: 2026-04-05*
