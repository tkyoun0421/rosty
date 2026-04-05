---
phase: 09
slug: verification-evidence-reconciliation
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-05
---

# Phase 09 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest 3.2.4` plus file-content checks |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm exec vitest run src/mutations/schedule/dal/scheduleDal.test.ts src/mutations/schedule/actions/createSchedule.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts src/queries/schedule/dal/listRecruitingSchedules.test.ts src/mutations/application/actions/createScheduleApplication.test.ts src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts src/flows/admin-invites/components/AdminInvitesPage.test.tsx src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` |
| **Full suite command** | `pnpm exec vitest run` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task's targeted command from the map below.
- **After every plan wave:** Run `pnpm exec vitest run`.
- **Before `$gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 45 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | SCHD-01, SCHD-02, SCHD-03 | verification doc + vitest | `pnpm exec vitest run src/mutations/schedule/dal/scheduleDal.test.ts src/mutations/schedule/actions/createSchedule.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts` | existing | pending |
| 09-01-02 | 01 | 1 | APPL-01 | verification doc + vitest | `pnpm exec vitest run src/queries/schedule/dal/listRecruitingSchedules.test.ts src/mutations/application/actions/createScheduleApplication.test.ts src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` | existing | pending |
| 09-01-03 | 01 | 1 | audit support | stale/missing evidence refresh + vitest | `pnpm exec vitest run src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts src/flows/admin-invites/components/AdminInvitesPage.test.tsx src/mutations/application/actions/submitScheduleApplication.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules.test.ts` | existing | pending |
| 09-02-01 | 02 | 2 | SCHD-01, SCHD-02, SCHD-03, APPL-01 | audit/doc consistency | `rg -n "02-VERIFICATION.md|06-VERIFICATION.md|07-VERIFICATION.md|Verification Evidence Reconciliation|Phase 09" .planning/v1.0-MILESTONE-AUDIT.md .planning/PROJECT.md .planning/ROADMAP.md .planning/STATE.md` | existing | pending |
| 09-02-02 | 02 | 2 | regression gate | full suite | `pnpm exec vitest run` | existing | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/mutations/schedule/dal/scheduleDal.test.ts` - verifies Phase 02 schedule creation and status persistence evidence.
- [ ] `src/mutations/schedule/actions/createSchedule.test.ts` - verifies Phase 02 admin create action evidence.
- [ ] `src/mutations/schedule/actions/updateScheduleStatus.test.ts` - verifies Phase 02 status-management evidence.
- [ ] `src/queries/schedule/dal/listRecruitingSchedules.test.ts` - verifies Phase 02 recruiting list evidence.
- [ ] `src/mutations/application/actions/createScheduleApplication.test.ts` - verifies Phase 02 apply-path evidence.
- [ ] `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` - verifies Phase 02 worker recruiting page evidence.
- [ ] `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` - verifies the resolved Phase 04 confirmed-only filter behavior.
- [ ] `src/flows/admin-invites/components/AdminInvitesPage.test.tsx` - verifies Phase 06 route-guard evidence.
- [ ] `src/mutations/application/actions/submitScheduleApplication.test.ts` - verifies Phase 07 freshness evidence.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin creates a schedule and sees the recruiting default in the live app | SCHD-01, SCHD-03 | Verification docs can prove the code path, but not the real app plus Supabase persistence loop | Open `/admin/schedules`, create a schedule, and confirm the saved row appears with `recruiting` status. |
| Worker sees a recruiting schedule and can apply exactly once in a live session | APPL-01 | Verification docs can prove the server action and page contract, but not the real session-backed worker flow | Open `/worker/schedules` as a worker, confirm a recruiting schedule appears, apply once, and confirm duplicate apply is rejected or shown as already applied. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or file-check dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all required evidence files and test anchors
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-05
