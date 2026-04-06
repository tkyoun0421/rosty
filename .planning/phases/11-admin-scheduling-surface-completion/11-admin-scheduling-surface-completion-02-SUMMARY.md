---
phase: 11-admin-scheduling-surface-completion
plan: 02
subsystem: ui
tags: [nextjs, ui, admin-assignment, attendance, confirmation-dialog]
requires:
  - phase: 11-admin-scheduling-surface-completion
    provides: readable admin scheduling workspace and detail-route entry from the saved schedules surface
provides:
  - schedule-detail header with facts strip and attendance-first hierarchy
  - shared-card assignment editor with separate draft and confirm actions
  - confirmation dialog and inline feedback that preserve existing assignment submit wrappers
affects: [phase-11, admin-assignment, attendance-review, worker-pay-preview]
tech-stack:
  added: []
  patterns:
    - attendance-first schedule detail pages with facts strip before editing controls
    - sticky assignment action card with inline Alert feedback for draft and confirm flows
key-files:
  created: []
  modified:
    - src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx
    - src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx
    - src/flows/admin-schedule-assignment/components/AssignmentSummaryCard.tsx
    - src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx
    - src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx
    - src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx
key-decisions:
  - "Moved the schedule-detail title and facts strip into the server page so the detail route presents stable context before any client-side editing begins."
  - "Kept draft save and final confirm as separate action buttons with same-page Alerts so admins do not lose context after write operations."
patterns-established:
  - "Admin detail routes should surface immutable schedule facts before interactive assignment controls."
  - "Draft-save and final-confirm feedback should remain inline via shared Alert surfaces instead of transient copy blocks."
requirements-completed: [ADMINUI-03]
duration: 6min
completed: 2026-04-06
---

# Phase 11 Plan 02: Admin Scheduling Surface Completion Summary

**Attendance-first schedule detail now frames assignment review with a facts strip, shared-card applicant controls, and a confirmation dialog that keeps draft and publish feedback inline**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-06T20:47:20+09:00
- **Completed:** 2026-04-06T20:53:08+09:00
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added a schedule-detail header and facts strip so admins can see schedule window, current status, and confirmed-worker scope before editing assignments.
- Rebuilt applicant assignment controls around shared Card, Badge, Button, and Alert primitives while preserving draft-save and final-confirm submit wrappers.
- Reworked the confirmation dialog into the same visual language and expanded regression coverage for the dialog summary plus inline success states.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild the schedule-detail shell, schedule facts, and summary regions** - `d427bfd` (feat)
2. **Task 2: Rebuild the applicant assignment controls and confirmation checkpoint** - `9ba98b9` (feat)

## Files Created/Modified

- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` - Server-owned detail header, facts strip, and attendance-first layout.
- `src/flows/admin-schedule-assignment/components/AttendanceReviewPanel.tsx` - Card-based attendance review summaries and worker status list.
- `src/flows/admin-schedule-assignment/components/AssignmentSummaryCard.tsx` - Shared-card assignment summary with filled and unfilled seat counts.
- `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx` - Shared-card applicant editor with inline draft/confirm feedback and sticky action controls.
- `src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx` - Publish-confirmation dialog summarizing filled seats, unfilled slots, and role-slot counts.
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` - Regression coverage for header hierarchy, draft payloads, confirmation dialog copy, and inline success messaging.

## Decisions Made

- Put schedule facts in the server page instead of the client panel so the route always opens with stable context before any client state initializes.
- Standardized save and confirm feedback around inline Alerts to keep success and error states readable without leaving the page or relying on route refreshes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed the duplicated detail-page heading from the client panel**
- **Found during:** Task 1 (Rebuild the schedule-detail shell, schedule facts, and summary regions)
- **Issue:** Moving the new schedule-detail header into `AdminScheduleAssignmentPage.tsx` left the old `Schedule assignment detail` heading inside `ApplicantAssignmentPanel.tsx`, creating duplicate page-level headings and a confusing hierarchy.
- **Fix:** Removed the stale in-panel schedule facts block so the page-level header remains the single source of detail context.
- **Files modified:** `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx`
- **Verification:** `pnpm exec vitest run src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/queries/attendance/dal/getAdminScheduleAttendanceDetail.test.ts`
- **Committed in:** `d427bfd` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix removed duplicated hierarchy introduced by the scheduled header refactor. No scope creep and no contract changes.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 03 can now align the operations dashboard copy and CTA language to the refreshed `/admin/schedules` and `/admin/schedules/[scheduleId]` workspace.
- The remaining Phase 11 work is presentation alignment only; schedule detail contracts and assignment feedback patterns are now stable.

## Self-Check: PASSED

---
*Phase: 11-admin-scheduling-surface-completion*
*Completed: 2026-04-06*
