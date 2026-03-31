---
phase: 03-assignment-and-pay-preview
verified: 2026-03-31T09:39:32.9018689Z
status: human_needed
score: 8/8 must-haves verified
human_verification:
  - test: "Admin assignment editor usability across slot reassignment flow"
    expected: "관리자가 스케줄 상세에서 신청자 검토, 역할 재배정, draft 저장, confirm 전환을 혼란 없이 수행할 수 있어야 한다."
    why_human: "레이아웃 우선순위, 선택 흐름, sticky action 영역의 실제 사용성은 브라우저 상호작용으로 확인해야 한다."
  - test: "Worker pay preview readability"
    expected: "근무자가 총 예상 급여, 계산 근거, assignment 카드 정보를 별도 설명 없이 이해할 수 있어야 한다."
    why_human: "PAY-04는 정보 존재뿐 아니라 가독성과 이해 가능성을 포함하므로 시각적 검토가 필요하다."
---

# Phase 3: Assignment And Pay Preview Verification Report

**Phase Goal:** 관리자가 신청자 목록을 검토하고 역할별 배정을 확정하며, 근무자가 확정된 근무와 예상 급여를 확인할 수 있게 한다.
**Verified:** 2026-03-31T09:39:32.9018689Z
**Status:** human_needed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 관리자는 한 스케줄 상세에서 역할 슬롯, 신청자, 현재 배정 상태를 함께 볼 수 있다. | ✓ VERIFIED | `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts` maps slot counts, applicants, and `unassigned/draft_assigned/confirmed_assigned` labels from joined schedule/application/assignment data. |
| 2 | 관리자는 확정 전에 draft 배정안을 저장할 수 있다. | ✓ VERIFIED | `src/mutations/assignment/actions/saveScheduleAssignmentDraft.ts` parses and persists draft rows only; `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx` saves in place without navigation. |
| 3 | 한 근무자는 같은 스케줄에 두 번 draft 배정될 수 없고, 한 슬롯은 headcount를 넘길 수 없다. | ✓ VERIFIED | DB uniqueness on `(schedule_id, worker_user_id)` plus DAL validation for slot capacity and applicant membership in `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql` and `src/mutations/assignment/dal/assignmentDal.ts`. |
| 4 | 배정 확정은 draft 저장과 분리된 명시적 액션이어야 한다. | ✓ VERIFIED | `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx` exposes separate save and confirm actions; `src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx` drives dedicated confirm UX. |
| 5 | 확정 시 assignment row와 schedule status가 함께 publish되고, 기존 상태 변경 경로는 `confirmed`를 직접 publish할 수 없다. | ✓ VERIFIED | `public.confirm_schedule_assignments` updates assignment rows and `schedules.status` together; generic status path only accepts `recruiting` or `assigning`. |
| 6 | 근무자는 dedicated route에서 자신에게 확정된 근무만 볼 수 있다. | ✓ VERIFIED | `src/app/worker/assignments/page.tsx` routes to `WorkerAssignmentPreviewPage`; `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` filters to `schedule_assignments.status = 'confirmed'` and confirmed schedules only. |
| 7 | 근무자는 총 예상 급여와 계산 근거 요약을 볼 수 있다. | ✓ VERIFIED | `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` renders total pay card first, calculation basis second, confirmed list third. |
| 8 | 9시간 초과 근무는 1.5배 overtime으로 계산된다. | ✓ VERIFIED | `src/queries/assignment/utils/calculatePayPreview.ts` applies 9-hour split and 1.5x multiplier as the canonical calculation path. |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql` | Assignment persistence, RLS, confirm transaction contract | ✓ VERIFIED | Enum/table/invariants at lines 1-25, worker RLS at 35-77, confirm RPC at 79-133. |
| `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts` | Admin schedule-centered review read model | ✓ VERIFIED | Joins schedules, role slots, applications, assignments and derives applicant statuses. |
| `src/mutations/assignment/dal/assignmentDal.ts` | Draft-save and confirm DAL | ✓ VERIFIED | Validates applicant membership/capacity, persists draft replacements, calls confirm RPC, reports unfilled slots. |
| `src/mutations/assignment/actions/saveScheduleAssignmentDraft.ts` | Admin-only draft save action | ✓ VERIFIED | Requires admin, parses payload, revalidates assignment detail and admin list tags. |
| `src/mutations/assignment/actions/confirmScheduleAssignments.ts` | Dedicated confirm action | ✓ VERIFIED | Requires admin, calls confirm DAL, revalidates admin and worker-facing tags. |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | Admin schedule-detail entry flow | ✓ VERIFIED | Requires admin, loads schedule detail, renders assignment panel. |
| `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx` | In-place draft edit and separate confirm UI | ✓ VERIFIED | Client editor is substantive and wired to both submit wrappers. |
| `src/app/admin/schedules/[scheduleId]/page.tsx` | Thin admin route | ✓ VERIFIED | Awaits async params and delegates to the flow component. |
| `src/queries/assignment/utils/calculatePayPreview.ts` | Canonical pay formula | ✓ VERIFIED | Single overtime-aware TypeScript calculation path. |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | Worker confirmed-assignment read model | ✓ VERIFIED | Uses session-bound client, confirmed filters, and pay calculation. |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | Worker confirmed-work/pay preview flow | ✓ VERIFIED | Total pay, calculation basis, and confirmed assignment list are rendered from live query data. |
| `src/app/worker/assignments/page.tsx` | Thin worker route | ✓ VERIFIED | Delegates to the worker flow. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts` | `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql` | Schedule/application/assignment joins | ✓ WIRED | Query selects `schedule_role_slots`, `schedule_applications`, and `schedule_assignments`; migration defines `schedule_assignments` and RLS contract. |
| `src/mutations/assignment/actions/saveScheduleAssignmentDraft.ts` | `src/mutations/assignment/schemas/saveScheduleAssignmentDraft.ts` | `parseSaveScheduleAssignmentDraft` | ✓ WIRED | Action parses `FormData` into whole-schedule payload before DAL write. |
| `src/mutations/assignment/dal/assignmentDal.ts` | `src/shared/config/cacheTags.ts` | Revalidated by calling actions | ✓ WIRED | Draft/confirm paths are consumed by actions that revalidate assignment detail, worker confirmed, and worker pay preview tags. |
| `src/mutations/assignment/actions/confirmScheduleAssignments.ts` | `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql` | `confirm_schedule_assignments` RPC | ✓ WIRED | Action -> DAL -> RPC publishes assignment rows and schedule status together. |
| `src/mutations/schedule/schemas/updateScheduleStatus.ts` | `src/mutations/schedule/dal/scheduleDal.ts` | Inline status hardening | ✓ WIRED | Schema restricts to `recruiting/assigning`; DAL rejects confirmed schedule edits and same-state transitions. |
| `src/flows/admin-schedules/components/ScheduleTable.tsx` | `src/app/admin/schedules/[scheduleId]/page.tsx` | Detail entry link | ✓ WIRED | Each schedule row links to `/admin/schedules/${schedule.id}`. |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | Server-first composition | ✓ WIRED | Worker flow loads signed-in user and confirmed assignments before render. |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | `src/queries/assignment/utils/calculatePayPreview.ts` | Per-row pay breakdown mapping | ✓ WIRED | Each confirmed assignment is mapped through `calculatePayPreview`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` | `detail` | `getAdminScheduleAssignmentDetail(scheduleId)` | Yes | ✓ FLOWING |
| `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx` | `assignments`, `applicants`, `scheduleStatus` | Server-loaded detail DTO plus submit wrappers | Yes | ✓ FLOWING |
| `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` | `assignments` | `listConfirmedWorkerAssignments(currentUser.id)` | Yes | ✓ FLOWING |
| `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` | Assignment preview rows | `schedule_assignments` + `schedules` + `schedule_role_slots` + `worker_rates` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Phase 03 assignment/admin/worker behaviors | `pnpm test -- src/shared/model/assignment.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/mutations/assignment/schemas/saveScheduleAssignmentDraft.test.ts src/mutations/assignment/dal/assignmentDal.test.ts src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts src/mutations/assignment/schemas/confirmScheduleAssignments.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/queries/assignment/utils/calculatePayPreview.test.ts src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx src/flows/worker-shell/components/WorkerShellPage.test.tsx` | 33 files passed, 77 tests passed | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| APPL-03 | 03-01, 03-03 | 관리자는 스케줄별 신청자 목록과 상태를 확인할 수 있다. | ✓ SATISFIED | Admin detail query and route/UI render applicants plus derived assignment labels. |
| ASGN-01 | 03-01, 03-03 | 관리자는 역할별 근무자를 배정할 수 있다. | ✓ SATISFIED | Draft-save schema/DAL/action plus in-place admin assignment editor. |
| ASGN-02 | 03-02, 03-03 | 관리자는 배정 결과를 확정해 최종 근무 정보를 제공할 수 있다. | ✓ SATISFIED | Dedicated confirm action, confirm dialog, and schedule status hardening remove bypass path. |
| ASGN-03 | 03-04 | 근무자는 자신의 확정 근무 일정과 역할을 확인할 수 있다. | ✓ SATISFIED | Worker route and confirmed-only query render role/date summaries. |
| PAY-02 | 03-04 | 시스템은 확정 근무 기준 예상 급여를 계산할 수 있다. | ✓ SATISFIED | Confirmed-worker query maps each row through canonical pay calculation. |
| PAY-03 | 03-04 | 9시간 초과 근무는 1.5배로 계산된다. | ✓ SATISFIED | `calculatePayPreview` splits regular/overtime hours and multiplies overtime by 1.5. |
| PAY-04 | 03-04 | 근무자는 자신의 확정 근무 예상 급여를 확인할 수 있다. | ✓ SATISFIED | Worker preview page shows one total pay amount plus calculation basis and per-assignment facts. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `src/flows/worker-shell/components/WorkerShellPage.tsx` | 9 | Mojibake in unauthorized fallback copy | ℹ️ Info | Does not block Phase 03 goal for worker users, but fallback copy quality is degraded. |

### Human Verification Required

### 1. Admin Assignment Editor Usability

**Test:** Open an admin schedule detail page, reassign applicants across role slots, save a draft, then open the confirm dialog and publish.
**Expected:** The summary-first layout, in-place draft save, and separate confirm action should remain clear on desktop and mobile without losing current edits.
**Why human:** Automated tests confirm structure and action wiring, but not real interaction clarity or sticky action behavior.

### 2. Worker Pay Preview Readability

**Test:** Open `/worker/assignments` for a worker with both regular-only and overtime-confirmed assignments.
**Expected:** The worker should be able to understand total pay, calculation basis, role, schedule window, hourly rate, and overtime application without needing hidden context.
**Why human:** PAY-04 includes readability and trust, which DOM assertions alone cannot verify.

### Gaps Summary

No automated implementation gaps were found against the Phase 03 goal. Admin review, draft assignment, explicit confirmation, worker confirmed-work visibility, and overtime-aware pay preview are all present and wired. Remaining work is human UX verification only.

---

_Verified: 2026-03-31T09:39:32.9018689Z_
_Verifier: Claude (gsd-verifier)_
