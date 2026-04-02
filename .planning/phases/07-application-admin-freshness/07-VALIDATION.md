---
phase: 07
slug: application-admin-freshness
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-03
---

# Phase 07 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts`
- **After every plan wave:** Run `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | APPL-02, APPL-03, DASH-02 | action | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts` | W0 | pending |
| 07-02-01 | 02 | 2 | APPL-02, APPL-03, DASH-02 | action | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts` | W0 | pending |
| 07-02-02 | 02 | 2 | APPL-03, DASH-02 | regression | `pnpm test -- src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` | partial | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/mutations/application/actions/submitScheduleApplication.test.ts` - verifies success-path worker/admin cache invalidation and duplicate/no-op behavior

*Existing infrastructure covers the remaining phase requirements once the new action test file exists.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin schedule detail reflects a new applicant after a worker apply | APPL-03 | Automated tests prove invalidation calls, but not the full app-level render handoff in browser navigation | As a worker, apply to a recruiting schedule. Then open the matching admin schedule detail page and confirm the applicant appears without manual cache clearing. |
| Admin dashboard applicant count reflects a new application | DASH-02 | Existing DAL tests cover mapping, but not the full live navigation cycle | Open `/admin`, note the affected schedule card applicant count, perform a worker application, then revisit `/admin` and confirm the count increments. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
