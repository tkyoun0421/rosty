---
phase: 08
slug: pay-preview-freshness
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-04
---

# Phase 08 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts`
- **After every plan wave:** Run `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | PAY-01, PAY-02 | action | `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts` | W0 | pending |
| 08-01-02 | 01 | 1 | PAY-02, PAY-04 | regression | `pnpm test -- src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` | partial | pending |
| 08-02-01 | 02 | 2 | PAY-01, PAY-02, PAY-04 | action + regression | `pnpm test -- src/mutations/worker-rate/actions/submitWorkerRate.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | partial | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/mutations/worker-rate/actions/submitWorkerRate.test.ts` - verifies success-path worker pay-preview invalidation and invalid-input non-invalidation
- [ ] `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` - verifies the cached worker pay-preview read subscribes to `cacheTags.assignments.workerPayPreview(workerUserId)`

*Existing infrastructure covers the worker preview rendering smoke checks once the new freshness regressions exist.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Worker pay preview total reflects an updated hourly rate | PAY-02, PAY-04 | Automated tests prove invalidation and cache-tag wiring, but not the full live navigation cycle between admin rate writes and worker preview rendering | As an admin, update a worker's hourly rate. Then revisit the worker confirmed-assignment/pay-preview page and confirm the expected total and hourly-rate breakdown reflect the new rate without manual cache clearing. |
| Unrelated workers stay unchanged after another worker's rate update | PAY-04 | Scope correctness is easiest to observe through a live multi-user check | Update worker A's rate, then open worker B's preview page and confirm worker B's expected pay is unchanged. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
