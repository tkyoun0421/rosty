---
phase: 05
slug: operations-dashboard
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 05 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `3.2.4` |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts src/queries/operations-dashboard/utils/operationsDashboard.test.ts src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx src/mutations/schedule/actions/submitSchedule.test.ts src/mutations/schedule/actions/submitScheduleStatus.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/attendance/actions/submitAttendanceCheckIn.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts src/queries/operations-dashboard/utils/operationsDashboard.test.ts src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx src/mutations/schedule/actions/submitSchedule.test.ts src/mutations/schedule/actions/submitScheduleStatus.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/attendance/actions/submitAttendanceCheckIn.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DASH-02 | unit | `pnpm test -- src/queries/operations-dashboard/utils/operationsDashboard.test.ts` | W0 | pending |
| 05-01-02 | 01 | 1 | DASH-02 | DAL | `pnpm test -- src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` | W0 | pending |
| 05-02-01 | 02 | 2 | DASH-01 | integration | `pnpm test -- src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` | W0 | pending |
| 05-02-02 | 02 | 2 | DASH-02 | integration | `pnpm test -- src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` | W0 | pending |
| 05-03-01 | 03 | 2 | DASH-01 | action | `pnpm test -- src/mutations/schedule/actions/submitSchedule.test.ts src/mutations/schedule/actions/submitScheduleStatus.test.ts` | W0 | pending |
| 05-03-02 | 03 | 2 | DASH-02,DASH-03 | action | `pnpm test -- src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/attendance/actions/submitAttendanceCheckIn.test.ts` | existing | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` - verifies window filter, nested aggregation, and confirmed-vs-draft staffing semantics
- [ ] `src/queries/operations-dashboard/utils/operationsDashboard.test.ts` - verifies anomaly priority and open-window logic
- [ ] `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` - verifies admin-only render, section ordering, and drill-down links
- [ ] `src/mutations/schedule/actions/submitSchedule.test.ts` - verifies dashboard tag revalidation after schedule writes
- [ ] `src/mutations/schedule/actions/submitScheduleStatus.test.ts` - verifies dashboard tag revalidation after schedule status changes

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual triage clarity for top anomaly prominence and Today/Upcoming section scanning | DASH-03 | The UI contract controls emphasis and hierarchy, which is difficult to judge from assertions alone | Open `/admin` as an admin, confirm the highest-priority anomaly badge is visually dominant on each card, and confirm `Today` renders before `Upcoming`. |
| Drill-down usefulness from dashboard card to existing schedule detail page | DASH-02 | Automated tests can assert links, but an end-to-end click is still needed to verify the handoff feels summary-first rather than duplicative | Open `/admin`, click `Review schedule` from at least one Today card and one Upcoming card, and confirm the existing schedule detail route opens without extra inline controls on the dashboard. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-01
