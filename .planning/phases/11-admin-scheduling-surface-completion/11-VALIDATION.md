---
phase: 11
slug: admin-scheduling-surface-completion
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-06
---

# Phase 11 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm exec vitest run src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` |
| **Full suite command** | `pnpm exec vitest run` |
| **Estimated runtime** | ~35 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task-specific targeted test command from the table below.
- **After every plan wave:** Run `pnpm exec vitest run src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 35 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | ADMINUI-01 | component + action | `pnpm exec vitest run src/flows/admin-schedules/components/CreateScheduleForm.test.tsx src/mutations/schedule/actions/createSchedule.test.ts src/mutations/schedule/actions/submitSchedule.test.ts` | W0 | pending |
| 11-01-02 | 01 | 1 | ADMINUI-02 | flow + DAL + action | `pnpm exec vitest run src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx src/queries/schedule/dal/listAdminSchedules.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts` | W0 | pending |
| 11-02-01 | 02 | 2 | ADMINUI-03 | flow + query | `pnpm exec vitest run src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` | yes | pending |
| 11-02-02 | 02 | 2 | ADMINUI-03 | flow + action | `pnpm exec vitest run src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts` | yes | pending |
| 11-03-01 | 03 | 3 | ADMINUI-04 | flow + DAL | `pnpm exec vitest run src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` | yes | pending |
| 11-03-02 | 03 | 3 | ADMINUI-04 | flow + utils + freshness | `pnpm exec vitest run src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx src/queries/operations-dashboard/utils/operationsDashboard.test.ts src/mutations/schedule/actions/submitSchedule.test.ts src/mutations/schedule/actions/submitScheduleStatus.test.ts` | yes | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/flows/admin-schedules/components/CreateScheduleForm.test.tsx` - verifies the rebuilt schedule creation surface, role-slot controls, and primary action text
- [ ] `src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx` - verifies admin gate, saved-schedules empty state, schedule row/card content, and inline status control behavior

*Existing detail and dashboard tests provide the regression baseline once assertions are expanded to match the refreshed surfaces.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real admin schedule creation from `/admin/schedules` | ADMINUI-01 | Automated tests prove action contracts, not the live browser form feel | Create a schedule with multiple role slots and confirm the saved schedule reappears in the refreshed list with readable details. |
| Real draft-save and final-confirm UX on the detail page | ADMINUI-03 | Product quality depends on actual interaction flow, not just action invocation | Open `/admin/schedules/[scheduleId]`, edit assignments, save a draft, then confirm and verify the feedback states make sense in sequence. |
| Dashboard-to-detail handoff after live schedule changes | ADMINUI-04 | Browser navigation and freshness feel are best validated live | Create or update a schedule, open `/admin/operations`, and confirm the dashboard surfaces the schedule and drills into the refreshed detail page cleanly. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 35s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
