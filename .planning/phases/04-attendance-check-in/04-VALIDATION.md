---
phase: 04
slug: attendance-check-in
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-31
---

# Phase 04 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm exec vitest <affected test files> -x` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm exec vitest <affected test files> -x`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | ATTD-01, ATTD-02 | DAL + schema + utils | `pnpm exec vitest run src/mutations/attendance/dal/attendanceDal.test.ts src/mutations/attendance/schemas/attendanceCheckIn.test.ts` | W0 | pending |
| 04-01-02 | 01 | 1 | ATTD-01, ATTD-02 | action + DAL + schema | `pnpm exec vitest run src/mutations/attendance/actions/createAttendanceCheckIn.test.ts src/mutations/attendance/dal/attendanceDal.test.ts src/mutations/attendance/schemas/attendanceCheckIn.test.ts` | W0 | pending |
| 04-02-01 | 02 | 2 | ATTD-01 | query DAL | `pnpm exec vitest run src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts` | W0 | pending |
| 04-02-02 | 02 | 2 | ATTD-01 | component + query DAL | `pnpm exec vitest run src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | W0 | pending |
| 04-03-01 | 03 | 2 | ATTD-03 | query DAL + component | `pnpm exec vitest run src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` | W0 | pending |
| 04-03-02 | 03 | 2 | ATTD-03 | component + query DAL | `pnpm exec vitest run src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` | W0 | pending |

*Status: pending -> green -> red -> flaky*

---

## Wave 0 Requirements

- [ ] `src/mutations/attendance/dal/attendanceDal.test.ts` - covers single-shot insert, confirmed-assignment enforcement, radius and lateness persistence
- [ ] `src/mutations/attendance/actions/createAttendanceCheckIn.test.ts` - covers worker auth and cache invalidation
- [ ] `src/mutations/attendance/schemas/attendanceCheckIn.test.ts` - covers payload parsing and invalid coordinate handling
- [ ] `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` - covers schedule-centric admin review and late/not-checked-in mapping
- [ ] `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` update - covers worker attendance availability, blocked states, and post-check-in rendering
- [ ] `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` update - covers attendance review panel ordering and status labels

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Browser geolocation permission denied flow | ATTD-01, ATTD-02 | Browser permission APIs and secure-context behavior are environment-dependent | Open worker confirmed assignment page in the browser, deny location permission, verify blocked copy explains why check-in cannot proceed. |
| Real-device venue-radius validation | ATTD-02 | Accurate GPS drift and secure-context geolocation cannot be reliably simulated in unit tests alone | Test on a device/browser with location access, confirm in-radius submit succeeds and out-of-radius submit is rejected with the configured error copy. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
