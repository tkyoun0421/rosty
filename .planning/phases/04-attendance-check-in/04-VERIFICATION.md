---
phase: 04-attendance-check-in
verified: 2026-03-31T11:45:02.9190078Z
status: gaps_found
score: 5/6 must-haves verified
gaps:
  - truth: "관리자가 기존 일정 상세 흐름 안에서 확정 근무자별 출근 상태와 지각 여부를 정확히 확인할 수 있다."
    status: failed
    reason: "Admin attendance DAL reads and summarizes all schedule assignment rows for a schedule, but does not filter to confirmed assignments. Draft assignments can therefore appear as not checked in/not open yet and inflate schedule-level counts."
    artifacts:
      - path: "src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts"
        issue: "Maps `row.schedule_assignments` directly into worker rows and summary counts without checking assignment status."
    missing:
      - "Limit the admin attendance query to confirmed schedule assignments only."
      - "Carry assignment status in the admin attendance query and filter out non-confirmed rows before computing worker statuses and summary counts."
      - "Add a regression test proving draft assignments do not appear in admin attendance review."
---

# Phase 4: Attendance Check-In Verification Report

**Phase Goal:** 근무자가 위치 기반 출근 체크를 제출하고, 관리자가 근무자별 출근 상태와 지각 여부를 확인할 수 있게 한다.
**Verified:** 2026-03-31T11:45:02.9190078Z
**Status:** gaps_found
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | The attendance backend accepts a worker check-in only for that worker's confirmed assignment and only once per assignment. | ✓ VERIFIED | `attendance_check_ins` is unique on `schedule_assignment_id`, RLS checks confirmed ownership, and the DAL queries `schedule_assignments` with `.eq("status", "confirmed")` before insert. |
| 2 | The server enforces the attendance open window and single-venue radius before insert, and stores the location snapshot needed later. | ✓ VERIFIED | `createAttendanceCheckInRecord` computes `opensAt`, rejects early or out-of-radius submits, and writes submitted coordinates, accuracy, distance, allowed radius, `within_allowed_radius`, and `is_late`. |
| 3 | A worker sees attendance status on the existing confirmed-assignment page rather than a separate attendance route. | ✓ VERIFIED | `src/app/worker/assignments/page.tsx` renders `WorkerAssignmentPreviewPage`, which composes confirmed assignments with `listWorkerAttendanceStatuses` and `AttendanceCheckInCard`. No worker attendance route exists under `src/app`. |
| 4 | A worker can submit one location-based check-in from the confirmed-assignment page and sees the recorded state afterward. | ✓ VERIFIED | `AttendanceCheckInCard` gathers browser geolocation, posts through `submitAttendanceCheckIn`, and flips local state to `submitted` after success or duplicate. |
| 5 | An admin reviews attendance inside the existing schedule detail flow, not a separate dashboard. | ✓ VERIFIED | `src/app/admin/schedules/[scheduleId]/page.tsx` renders `AdminScheduleAssignmentPage`, which co-loads assignment detail and attendance detail and renders `AttendanceReviewPanel`. No admin attendance route exists under `src/app`. |
| 6 | The admin schedule detail shows each confirmed worker as checked in, late, not checked in, or not open yet, with correct schedule-level counts. | ✗ FAILED | `getAdminScheduleAttendanceDetail.ts` loads `schedule_assignments!left(...)` without a confirmed-status filter and maps all returned assignments into `workers` and summary counts. Draft assignments can be misreported as attendance misses. |

**Score:** 5/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `supabase/migrations/20260403_phase4_attendance_check_in.sql` | Attendance persistence, uniqueness, indexes, RLS | ✓ VERIFIED | Table, uniqueness, checks, indexes, and worker/admin policies are present. |
| `src/shared/config/attendance.ts` | Venue config | ✓ VERIFIED | Env-backed latitude/longitude/radius parsing exists. |
| `src/mutations/attendance/dal/attendanceDal.ts` | Confirmed-assignment validation and attendance writes | ✓ VERIFIED | Substantive, wired, and data-backed through Supabase insert path. |
| `src/mutations/attendance/actions/createAttendanceCheckIn.ts` | Worker-authenticated orchestration and stable result codes | ✓ VERIFIED | Auth gates, parses input, maps duplicate/too-early/out-of-radius errors. |
| `src/mutations/attendance/actions/submitAttendanceCheckIn.ts` | Submit wrapper and tag invalidation | ✓ VERIFIED | Successful submits revalidate attendance and worker-confirmed assignment tags. |
| `src/queries/attendance/types/workerAttendanceStatus.ts` | Worker attendance DTO | ✓ VERIFIED | Used by worker read model and client card. |
| `src/queries/attendance/dal/listWorkerAttendanceStatuses.ts` | Worker attendance read model | ✓ VERIFIED | Starts from confirmed assignments and joins attendance rows by assignment id. |
| `src/mutations/attendance/components/AttendanceCheckInCard.tsx` | Worker check-in CTA and blocked/submitted states | ✓ VERIFIED | Client-only geolocation logic is wired to submit action and rendered state. |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | Worker page integration | ✓ VERIFIED | Route-facing flow renders attendance card per confirmed assignment. |
| `src/queries/attendance/types/adminScheduleAttendanceDetail.ts` | Admin attendance DTO | ✓ VERIFIED | Render-ready DTO exists and is consumed by the review panel. |
| `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` | Admin attendance read model | ⚠️ HOLLOW | Exists and is wired, but its source query does not constrain to confirmed assignments before deriving worker statuses/counts. |
| `src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx` | Admin summary and per-worker review UI | ⚠️ HOLLOW | UI is substantive and wired, but it renders the over-broad DAL result. |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | Admin page integration | ✓ VERIFIED | Existing schedule detail flow loads attendance alongside assignment detail. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `createAttendanceCheckIn.ts` | `20260403_phase4_attendance_check_in.sql` | one attendance row per confirmed assignment | ✓ VERIFIED | DAL writes `attendance_check_ins` keyed by `schedule_assignment_id`; schema enforces uniqueness and confirmed-assignment consistency. |
| `createAttendanceCheckIn.ts` | `attendance.ts` | server-side geofence validation | ✓ VERIFIED | DAL loads venue config before radius validation. |
| `submitAttendanceCheckIn.ts` | `cacheTags.ts` | attendance and worker-confirmed invalidation | ✓ VERIFIED | Manual check: `revalidateTag(cacheTags.attendance.*)` and `cacheTags.assignments.workerConfirmed(...)` are present. |
| `WorkerAssignmentPreviewPage.tsx` | `listWorkerAttendanceStatuses.ts` | worker page joins assignments to attendance status | ✓ VERIFIED | Flow loads attendance statuses in parallel with confirmed assignments. |
| `AttendanceCheckInCard.tsx` | `submitAttendanceCheckIn.ts` | client geolocation submit wrapper | ✓ VERIFIED | Card submits `FormData` via the server action. |
| `AdminScheduleAssignmentPage.tsx` | `getAdminScheduleAttendanceDetail.ts` | schedule detail co-loads attendance review | ✓ VERIFIED | Page fetches attendance detail alongside assignment detail. |
| `getAdminScheduleAttendanceDetail.ts` | `20260403_phase4_attendance_check_in.sql` | schedule-centric attendance read | ⚠️ PARTIAL | Query joins attendance rows, but it does not preserve the confirmed-only boundary required by the phase contract. |
| `AttendanceReviewPanel.tsx` | `adminScheduleAttendanceDetail.ts` | DTO drives summary and labels | ✓ VERIFIED | Panel consumes DTO counts and worker statuses directly. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | `attendanceStatuses` | `listWorkerAttendanceStatuses` -> confirmed assignments + `attendance_check_ins` | Yes | ✓ FLOWING |
| `src/mutations/attendance/components/AttendanceCheckInCard.tsx` | `status` | initial prop from worker read model, then `submitAttendanceCheckIn` result | Yes | ✓ FLOWING |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | `attendanceDetail` | `getAdminScheduleAttendanceDetail` -> schedules + schedule_assignments + attendance rows | No, not scoped correctly | ⚠️ HOLLOW |
| `src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx` | `detail.summary`, `detail.workers` | admin attendance DAL result | No, inherits unfiltered assignment population | ⚠️ HOLLOW |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Backend attendance mutation returns stable outcomes | `pnpm exec vitest run src/mutations/attendance/actions/createAttendanceCheckIn.test.ts` | 1 file passed, 4 tests passed | ✓ PASS |
| Worker attendance page renders and submits from `/worker/assignments` flow | `pnpm exec vitest run src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` | 1 file passed, 6 tests passed | ✓ PASS |
| Admin attendance query maps labels and summary counts | `pnpm exec vitest run src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts` | 1 file passed, 5 tests passed | ✓ PASS |
| Phase docs quick-run command is executable as written | `pnpm exec vitest ... -x` | Vitest 3.2.4 rejects `-x` as an unknown option | ✗ FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| ATTD-01 | 04-01, 04-02 | 근무자는 자신의 확정 근무에 대해 위치 기반 출근 체크를 제출할 수 있다. | ✓ SATISFIED | Worker route remains `/worker/assignments`; confirmed-assignment page renders `AttendanceCheckInCard`; submit action and worker tests pass. |
| ATTD-02 | 04-01 | 시스템은 출근 체크 시점의 위치 정보를 저장해 현장 출근 검증에 활용할 수 있다. | ✓ SATISFIED | Migration and DAL persist location, accuracy, distance, allowed radius, within-radius snapshot, and lateness flags. |
| ATTD-03 | 04-03 | 관리자는 근무자별 출근 상태와 지각 여부를 확인할 수 있다. | ✗ BLOCKED | Admin read path is present, but `getAdminScheduleAttendanceDetail.ts` does not filter to confirmed assignments, so worker-level statuses and counts can be wrong whenever draft assignments exist. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `src/queries/attendance/dal/getAdminScheduleAttendanceDetail.ts` | 95, 119, 141 | Unfiltered `schedule_assignments` are mapped directly into worker rows and summary counts | 🛑 Blocker | Draft assignments can appear as not checked in/not open yet, violating the confirmed-worker admin review contract. |
| `.planning/phases/04-attendance-check-in/04-VALIDATION.md` | 22, 30, 41-46 | Stale Vitest `-x` flag in validation commands | ℹ️ Info | Verification docs are out of sync with installed Vitest 3.2.4; runtime behavior is unaffected, but phase docs are misleading. |

### Human Verification Required

### 1. Geolocation Permission Denied

**Test:** Open `/worker/assignments`, deny browser location permission, and attempt check-in on an open assignment.
**Expected:** The card remains blocked and explains that location permission is required.
**Why human:** Browser permission prompts and secure-context behavior are environment-dependent.

### 2. Real-Device Venue Radius Validation

**Test:** On a real device or browser with location access, attempt one check-in from inside the venue radius and one from outside it.
**Expected:** In-radius submit succeeds; out-of-radius submit is rejected with the configured helper copy.
**Why human:** Real GPS drift and device geolocation accuracy cannot be validated reliably from static analysis or unit tests.

### Gaps Summary

Phase 4 is mostly implemented: the backend contract is real, the worker route is the intended single entry point, and successful submissions invalidate the right cache tags. The remaining gap is in the admin attendance read model. It is wired into the existing schedule-detail flow, but it derives per-worker statuses and counts from every schedule assignment row instead of confirmed assignments only. That means ATTD-03 is not reliably achieved yet, because draft assignments can be surfaced as missing check-ins.

The phase planning artifacts also still advertise `vitest ... -x`, which no longer works with Vitest 3.2.4. That does not block the product goal, but it should be corrected so future verification commands match the installed toolchain.

---

_Verified: 2026-03-31T11:45:02.9190078Z_
_Verifier: Claude (gsd-verifier)_
