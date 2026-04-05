---
phase: 08-pay-preview-freshness
verified: 2026-04-05T10:12:23Z
status: human_needed
score: 3/3 must-haves verified
human_verification:
  - test: "Worker pay preview reflects an updated hourly rate after an admin rate change"
    expected: "After an admin saves a worker's hourly rate, the next worker visit to `/worker/assignments` shows the updated hourly rate and recalculated expected pay without manual cache clearing."
    why_human: "Automated tests prove invalidation and cache-tag wiring, but not the real admin-write to worker-navigation cycle in a live environment."
  - test: "Unrelated workers do not refresh to another worker's pay-preview change"
    expected: "Updating worker A's hourly rate changes worker A's preview only; worker B's preview remains unchanged."
    why_human: "Scope correctness across separate live worker sessions is best validated through a human multi-user check."
---

# Phase 08: Pay Preview Freshness Verification Report

**Phase Goal:** Ensure that after an admin updates a worker rate, the worker's existing confirmed-assignment and pay-preview flow reflects the latest hourly rate on the next render or navigation without widening invalidation to unrelated workers.
**Verified:** 2026-04-05T10:12:23Z
**Status:** human_needed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | A successful admin worker-rate write refreshes only the affected worker pay-preview cache tag. | VERIFIED | [submitWorkerRate.ts](/C:/code/rosty/src/mutations/worker-rate/actions/submitWorkerRate.ts) awaits `upsertWorkerRate(...)` and then calls `revalidateTag(cacheTags.assignments.workerPayPreview(userId), "max")`. The colocated action regression in [submitWorkerRate.test.ts](/C:/code/rosty/src/mutations/worker-rate/actions/submitWorkerRate.test.ts) passed and also proves failed submissions do not revalidate tags. |
| 2 | The cached worker confirmed-assignment/pay-preview read subscribes to the dedicated worker pay-preview tag. | VERIFIED | [listConfirmedWorkerAssignments.ts](/C:/code/rosty/src/queries/assignment/dal/listConfirmedWorkerAssignments.ts) now attaches `cacheTags.assignments.workerPayPreview(workerUserId)` alongside `assignments.all` and `workerConfirmed(workerUserId)`. The cached-branch regression in [listConfirmedWorkerAssignments.test.ts](/C:/code/rosty/src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts) passed against the exact three-tag array. |
| 3 | The existing worker preview flow remains the consumer of the refreshed query and still renders correctly. | VERIFIED | [WorkerAssignmentPreviewPage.tsx](/C:/code/rosty/src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx) still calls `listConfirmedWorkerAssignments(currentUser.id)` without any interface change. The worker preview smoke suite in [WorkerAssignmentPreviewPage.test.tsx](/C:/code/rosty/src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx) passed, and the full Vitest suite passed as well. |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/mutations/worker-rate/actions/submitWorkerRate.ts` | Admin rate submit wrapper revalidates the dedicated worker pay-preview tag after success | VERIFIED | Exists, substantive, and revalidates the exact tag required by the phase. |
| `src/mutations/worker-rate/actions/submitWorkerRate.test.ts` | Success-path invalidation and failure-path non-invalidation regression coverage | VERIFIED | Exists and passed. |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | Cached worker preview query subscribes to `workerPayPreview(workerUserId)` | VERIFIED | Exists, substantive, and preserves the existing short-circuit/data contract. |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` | Cached-query contract assertion for the three-tag array | VERIFIED | Exists and passed. |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | Existing worker pay-preview flow remains the consumer | VERIFIED | Exists and still calls `listConfirmedWorkerAssignments(currentUser.id)`. |
| `src/shared/config/cacheTags.ts` | Dedicated worker pay-preview tag definition | VERIFIED | Existing tag definition is now exercised by both the query and the submit wrapper. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/mutations/worker-rate/actions/submitWorkerRate.ts` | `src/mutations/worker-rate/actions/upsertWorkerRate.ts` | Success-gated wrapper orchestration | WIRED | The wrapper preserves the existing domain write path and invalidates only after `await upsertWorkerRate(...)` succeeds. |
| `src/mutations/worker-rate/actions/submitWorkerRate.ts` | `src/shared/config/cacheTags.ts` | Exact worker pay-preview tag invalidation | WIRED | The wrapper imports `cacheTags` and revalidates `workerPayPreview(userId)` directly. |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | `src/shared/config/cacheTags.ts` | Dedicated pay-preview tag on the cached read | WIRED | The cached query attaches `assignments.all`, `workerConfirmed(workerUserId)`, and `workerPayPreview(workerUserId)`. |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | Existing preview flow consumes refreshed data | WIRED | The page still awaits `listConfirmedWorkerAssignments(currentUser.id)` in its server-side flow composition. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/mutations/worker-rate/actions/submitWorkerRate.ts` | `userId`, `hourlyRateCents` | `FormData` from the admin worker-rate surface | Yes | FLOWING |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | `cachedQuery` | `schedule_assignments`, `worker_rates`, and dedicated cache tags | Yes | FLOWING |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | `assignments` | `listConfirmedWorkerAssignments(currentUser.id)` | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Phase 08 freshness regression bundle | `pnpm exec vitest run src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | 3 files passed, 12 tests passed | PASS |
| Full regression gate | `pnpm exec vitest run` | 53 files passed, 151 tests passed | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| PAY-01 | 08-02 | Admins can register and update worker hourly rates. | SATISFIED | The existing `upsertWorkerRate` path remains intact and the submit wrapper now adds success-only freshness orchestration without changing the admin write contract. |
| PAY-02 | 08-01, 08-02 | The system calculates expected pay from confirmed assignments and worker rates. | SATISFIED | The worker pay-preview query still computes expected pay from confirmed assignments and worker rates, and now refreshes after rate updates via the dedicated pay-preview tag. |
| PAY-04 | 08-01, 08-02 | Workers can review their own confirmed work and expected pay. | SATISFIED | The existing worker preview flow remains live, and automated coverage passed for the refreshed query plus downstream page rendering. |

### Anti-Patterns Found

None.

### Human Verification Required

### 1. Worker pay preview reflects an updated hourly rate after an admin rate change

**Test:** As an admin, update a worker's hourly rate. Then revisit `/worker/assignments` as that worker.
**Expected:** The page shows the updated hourly rate and recalculated expected pay without manual cache clearing or UI refresh controls.
**Why human:** Automated tests prove the invalidation and cache-tag contract, but not the live cross-session navigation cycle.

### 2. Unrelated workers do not refresh to another worker's pay-preview change

**Test:** Update worker A's rate, then open `/worker/assignments` as worker B.
**Expected:** Worker B's preview remains unchanged while worker A's preview reflects the new rate.
**Why human:** This scope check depends on observing separate worker sessions, which is best handled through manual UAT.

### Gaps Summary

No automated implementation gaps were found against the Phase 08 goal. The rate submit wrapper now revalidates the dedicated worker pay-preview tag, the cached worker read subscribes to that tag, and both the targeted regression bundle and the full test suite passed. Remaining work is manual UAT for the live admin-write to worker-preview loop and unrelated-worker scoping check.

---

_Verified: 2026-04-05T10:12:23Z_
_Verifier: Codex (inline phase verification)_
