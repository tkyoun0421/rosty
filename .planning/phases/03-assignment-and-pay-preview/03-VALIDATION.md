---
phase: 03
slug: assignment-and-pay-preview
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-31
---

# Phase 03 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- <touched test file>` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- <touched test file>`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | APPL-03 | unit | `pnpm test -- src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts` | W0 | pending |
| 03-01-02 | 01 | 1 | ASGN-01 | unit | `pnpm test -- src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts` | W0 | pending |
| 03-02-01 | 02 | 2 | ASGN-02 | unit | `pnpm test -- src/mutations/assignment/actions/confirmScheduleAssignments.test.ts` | W0 | pending |
| 03-04-01 | 04 | 2 | ASGN-03 | unit | `pnpm test -- src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` | W0 | pending |
| 03-04-02 | 04 | 2 | PAY-02 | unit | `pnpm test -- src/queries/assignment/utils/calculatePayPreview.test.ts` | W0 | pending |
| 03-04-03 | 04 | 2 | PAY-03 | unit | `pnpm test -- src/queries/assignment/utils/calculatePayPreview.test.ts` | W0 | pending |
| 03-04-04 | 04 | 2 | PAY-04 | component | `pnpm test -- src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | W0 | pending |

---

## Wave 0 Requirements

- [ ] `src/mutations/assignment/schemas/saveScheduleAssignmentDraft.test.ts` - validates whole-schedule payload normalization
- [ ] `src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts` - covers ASGN-01
- [ ] `src/mutations/assignment/actions/confirmScheduleAssignments.test.ts` - covers ASGN-02
- [ ] `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts` - covers APPL-03
- [ ] `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` - covers ASGN-03 and PAY-04 read boundary
- [ ] `src/queries/assignment/utils/calculatePayPreview.test.ts` - covers PAY-02 and PAY-03
- [ ] `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` - covers PAY-04 rendering

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin assignment editor usability across slot reassignment flow | ASGN-01 | Interaction density and drag/select ergonomics are easier to validate in-browser | Create a recruiting schedule with multiple applicants, save a draft assignment, change slot selections, and confirm the persisted draft matches the visible state |
| Worker pay preview readability | PAY-04 | The requirement includes calculation-basis clarity, which needs UX review beyond DOM assertions | Open the worker confirmed-work page with and without overtime and verify the total, role, hours, and overtime note are all understandable without hidden context |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-31
