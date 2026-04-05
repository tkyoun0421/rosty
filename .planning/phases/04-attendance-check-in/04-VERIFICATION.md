---
phase: 04-attendance-check-in
verified: 2026-04-05T20:02:07.7069104+09:00
status: human_needed
score: 6/6 must-haves verified
human_verification:
  - test: "Geolocation permission denied flow"
    expected: "Open `/worker/assignments`, deny browser location permission, and attempt check-in on an open assignment. The card stays blocked and explains that location permission is required."
    why_human: "Browser permission prompts and secure-context behavior are environment-dependent."
  - test: "Real-device venue-radius validation"
    expected: "Attempt one check-in from inside the venue radius and one from outside it. The in-radius submit succeeds and the out-of-radius submit is rejected with the configured helper copy."
    why_human: "Real GPS drift and device geolocation accuracy cannot be validated reliably from static analysis or unit tests."
---

# Phase 04: Attendance Check-In Verification Report

**Phase Goal:** Let workers submit location-based attendance from their confirmed-assignment page and let admins review attendance and lateness inside the existing schedule detail flow.
**Verified:** 2026-04-05T20:02:07.7069104+09:00
**Status:** human_needed
**Re-verification:** Yes - refreshed during Phase 09 evidence reconciliation to remove stale blocker text and align the report to the current confirmed-only admin attendance logic.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | The attendance backend accepts one worker check-in per confirmed assignment and keeps duplicate/forbidden outcomes stable. | VERIFIED | `src/mutations/attendance/actions/createAttendanceCheckIn.test.ts` passed and covers stable mutation outcomes around the confirmed-assignment attendance contract. |
| 2 | The worker attendance read path starts from confirmed assignments and returns one attendance status per confirmed assignment. | VERIFIED | `src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts` passed and proves the read model starts from confirmed assignments even when no attendance rows exist yet. |
| 3 | Workers review attendance on the existing confirmed-assignment page and can submit one browser-geolocation check-in from there. | VERIFIED | `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` passed and covers check-in-first layout, blocked states, denied permission help, and successful card-state update after submit. |
| 4 | The worker page still shows the recorded attendance state instead of allowing blind resubmission. | VERIFIED | `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` proves submitted attendance disables the CTA and renders the recorded state. |
| 5 | Admins review attendance inside the existing schedule detail flow instead of a separate attendance route. | VERIFIED | `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` passed and proves attendance review renders before applicant controls inside the schedule detail page. |
| 6 | The admin attendance read model now includes only confirmed assignments when computing worker rows and summary counts. | VERIFIED | `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` now filters with `assignment.status === "confirmed"`, and `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` passed with the explicit regression `filters out draft assignments from admin attendance review and summary counts`. |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/mutations/attendance/actions/createAttendanceCheckIn.ts` | Worker-authenticated check-in orchestration | VERIFIED | Current action regression stays green and still represents the backend attendance mutation contract. |
| `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts` | Confirmed-assignment-first worker attendance read model | VERIFIED | Current DAL regression proves the confirmed-assignment boundary on the worker side. |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | Worker attendance integration on `/worker/assignments` | VERIFIED | Current component regression covers blocked, open, and submitted states. |
| `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` | Confirmed-only admin attendance read model | VERIFIED | The source now filters to `confirmed` assignments before row/status mapping. |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | Admin attendance review inside existing schedule detail flow | VERIFIED | Current component regression proves attendance review remains inside the schedule detail composition. |
| `.planning/phases/04-attendance-check-in/04-VALIDATION.md` | Current direct Vitest command map | VERIFIED | Phase 09 refreshed the stale `vitest ... -x` command forms to direct `pnpm exec vitest run ...`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts` | Server-first worker attendance composition | WIRED | The worker page regression proves the page loads attendance statuses for the signed-in worker. |
| `src/mutations/attendance/components/AttendanceCheckInCard.tsx` | `src/mutations/attendance/actions/submitAttendanceCheckIn.ts` | Client geolocation submit path | WIRED | The worker page regression proves one successful submit updates the rendered card state. |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` | Schedule-detail attendance review | WIRED | The admin page regression proves the schedule detail flow still loads attendance review through the DAL. |
| `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` | `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` | Confirmed-only admin count regression | WIRED | The new source filter is pinned by the explicit draft-assignment exclusion regression. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts` | `assignmentStatuses` | confirmed `schedule_assignments` plus `attendance_check_ins` | Yes | FLOWING |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | `attendanceStatuses` | `listWorkerAttendanceStatuses(currentUser.id)` | Yes | FLOWING |
| `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` | `workers`, `summary` | confirmed-only `schedule_assignments` plus attendance rows | Yes | FLOWING |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | `attendanceDetail` | `getAdminScheduleAttendanceDetail(scheduleId)` | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Backend attendance mutation and worker status read bundle | `pnpm exec vitest run src/mutations/attendance/actions/createAttendanceCheckIn.test.ts src/queries/attendance/dal/listWorkerAttendanceStatuses.test.ts` | 2 files passed, 7 tests passed | PASS |
| Refreshed Phase 04 admin/worker attendance evidence bundle | `pnpm exec vitest run src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | 3 files passed, 17 tests passed | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `ATTD-01` | `04-01-PLAN.md`, `04-02-PLAN.md` | Workers can submit attendance from their own confirmed work. | SATISFIED | The worker read model and page regressions prove confirmed-assignment attendance status and one-submit card behavior on `/worker/assignments`. |
| `ATTD-02` | `04-01-PLAN.md` | The system uses location and timing data to validate check-in. | SATISFIED | The create-attendance action regression still proves the mutation contract and stable outcome mapping for check-in validation. |
| `ATTD-03` | `04-03-PLAN.md` | Admins can review attendance and lateness for the confirmed workers on a schedule. | SATISFIED | The admin attendance DAL now filters to `confirmed` assignments and the explicit draft-exclusion regression passed. |

### Anti-Patterns Found

None.

### Human Verification Required

### 1. Geolocation permission denied flow

**Test:** Open `/worker/assignments`, deny browser location permission, and attempt check-in on an open assignment.
**Expected:** The card stays blocked and explains that location permission is required.
**Why human:** Browser permission prompts and secure-context behavior are environment-dependent.

### 2. Real-device venue-radius validation

**Test:** Attempt one check-in from inside the venue radius and one from outside it on a real device or browser with location access.
**Expected:** The in-radius submit succeeds and the out-of-radius submit is rejected with the configured helper copy.
**Why human:** Real GPS drift and device geolocation accuracy cannot be validated reliably from static analysis or unit tests.

### Gaps Summary

No automated implementation gaps remain against the Phase 04 goal. The stale blocker about draft assignments surfacing in admin attendance review is no longer true in the current codebase, the regression proving confirmed-only admin counts now passes, and the validation commands were refreshed to direct `pnpm exec vitest run ...` syntax. Remaining work is live browser/device confirmation of geolocation permission and venue-radius behavior.

---

_Verified: 2026-04-05T20:02:07.7069104+09:00_
_Verifier: Codex (inline Phase 09 execution)_
