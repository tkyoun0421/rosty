---
phase: 12
slug: worker-work-surface-completion
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-07
---

# Phase 12 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm exec vitest run src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` |
| **Full suite command** | `pnpm exec vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run the targeted verification command from the table below.
- **After every plan wave:** Run `pnpm exec vitest run src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | WORKUI-01 | query + flow | `pnpm exec vitest run src/queries/schedule/dal/listRecruitingSchedules.test.ts src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` | yes | pending |
| 12-01-02 | 01 | 1 | WORKUI-01, WORKUI-03 | action + flow | `pnpm exec vitest run src/mutations/application/actions/submitScheduleApplication.test.ts src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` | yes | pending |
| 12-02-01 | 02 | 2 | WORKUI-02 | query + flow | `pnpm exec vitest run src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | yes | pending |
| 12-02-02 | 02 | 2 | WORKUI-02, WORKUI-03 | attendance + flow | `pnpm exec vitest run src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx src/mutations/attendance/actions/submitAttendanceCheckIn.test.ts` | yes | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No separate Wave 0 bootstrap files are required for this run.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real worker apply flow from `/worker/schedules` | WORKUI-01 | Automated tests prove data flow and invalidation, not live browser clarity | Support a worker account through apply, then verify the surface clearly moves from apply-ready to applied / waiting state. |
| Confirmed work with missing worker rate | WORKUI-02, WORKUI-03 | Needs controlled live data to verify the unavailable branch honestly | Open `/worker/assignments` for a worker with confirmed assignments but no worker rate and verify the page shows confirmed work plus pay-unavailable guidance. |
| Secure-context geolocation check-in | WORKUI-02 | Browser permissions, HTTPS, and device location quality are not fully covered by automation | Use a real secure browser session, attempt check-in, and verify open / denied / success messaging. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or existing test dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
