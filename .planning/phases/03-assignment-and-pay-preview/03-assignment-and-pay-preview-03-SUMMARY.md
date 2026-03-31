---
phase: 03-assignment-and-pay-preview
plan: 03
subsystem: ui
tags: [nextjs, react, server-actions, vitest, admin-ui, assignment-workflow]
requires:
  - phase: 03-01
    provides: admin schedule assignment detail query and draft-save persistence
  - phase: 03-02
    provides: dedicated assignment confirm action and publish invalidation
provides:
  - Admin schedule-detail route for assignment review
  - In-place draft save UI over the Phase 3 assignment backend
  - Separate confirm dialog wired to the dedicated confirm action
  - Direct entry from the admin schedule list into schedule detail
affects: [phase-03-admin-assignment-ui, admin-schedule-list, assignment-confirmation]
tech-stack:
  added: []
  patterns: [thin async route params, server-fetched flow with client-side editor, separate draft-save and confirm actions]
key-files:
  created:
    - src/app/admin/schedules/[scheduleId]/page.tsx
    - src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx
    - src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx
    - src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx
    - src/flows/admin-schedule-assignment/components/AssignmentSummaryCard.tsx
    - src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx
    - src/flows/admin-schedule-assignment/utils/adminScheduleAssignment.ts
  modified:
    - src/flows/admin-schedules/components/ScheduleTable.tsx
key-decisions:
  - Keep the route thin and fetch detail data in the flow entry before handing stateful editing to a client component.
  - Preserve draft-save and final-confirm as separate buttons with distinct feedback states instead of a single publish control.
  - Use ASCII UI copy in the new flow to avoid the repo's active Windows encoding corruption on non-ASCII literals.
patterns-established:
  - "Pattern 1: Server flow reads detail DTOs and hands an editable snapshot to a client panel for in-place server-action submits."
  - "Pattern 2: Admin assignment pages expose summary, applicant controls, and sticky actions as separate UI regions."
requirements-completed: [APPL-03, ASGN-01, ASGN-02]
duration: 15min
completed: 2026-03-31
---

# Phase 3 Plan 3: Assignment And Pay Preview Summary

**Admin schedule detail now supports in-place draft assignment saves, separate final confirmation, and direct entry from the admin schedule list**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-31T18:12:00+09:00
- **Completed:** 2026-03-31T18:27:20+09:00
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Added the thin dynamic admin schedule-detail route at `src/app/admin/schedules/[scheduleId]/page.tsx`.
- Built a schedule-centered admin assignment editor that reads the existing detail DTO, edits assignments in place, and submits draft saves without navigation.
- Added a dedicated confirm dialog that summarizes filled and unfilled slots before calling the explicit confirm backend.
- Added a clear schedule-detail link from the admin schedule list.

## Task Commits

Skipped by request. The user explicitly required no git commits or pushes for this execution.

## Files Created/Modified
- `src/app/admin/schedules/[scheduleId]/page.tsx` - Thin Next.js route that awaits async params and renders the assignment flow.
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx` - Server flow entry that enforces admin access and loads the schedule-detail read model.
- `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx` - Client-side assignment editor with local slot selection, draft save feedback, and confirm entry.
- `src/flows/admin-schedule-assignment/components/AssignmentSummaryCard.tsx` - Filled/unfilled slot summary card for the right-side overview region.
- `src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx` - Separate confirmation modal summarizing worker-visible publication consequences.
- `src/flows/admin-schedule-assignment/utils/adminScheduleAssignment.ts` - Pure mapping helpers for editable assignments, summary counts, and applicant status refresh.
- `src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx` - UI tests for hierarchy order, in-place draft save, separate confirm, and schedule-list entry.
- `src/flows/admin-schedules/components/ScheduleTable.tsx` - Added the route entry link into schedule detail.

## Decisions Made
- Used a server flow plus client editor split so the route stays thin while the editing surface can preserve local state across in-place saves.
- Kept the confirm workflow UI-only in this plan and delegated all publish rules to the explicit backend confirm action from 03-02.
- Switched the new UI copy to ASCII because non-ASCII strings were being corrupted by the current repo/tooling encoding path.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced non-ASCII literals in the new UI with ASCII copy**
- **Found during:** Task 1 and Task 2 implementation
- **Issue:** Newly added Korean literals were being mangled by the current Windows encoding path, creating syntax and rendering risk in the edited files.
- **Fix:** Rewrote the new route and component copy in ASCII while preserving the required UI structure and action separation.
- **Files modified:** `src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx`, `src/flows/admin-schedule-assignment/components/AssignmentSummaryCard.tsx`, `src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx`, `src/flows/admin-schedules/components/ScheduleTable.tsx`
- **Verification:** `pnpm test -- src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.test.tsx`
- **Committed in:** None - commits were explicitly disabled by user instruction.

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The copy fallback avoided encoding-induced breakage without changing the route structure, backend wiring, or interaction model required by the plan.

## Issues Encountered
- The worktree was already dirty before execution and included unrelated planning and Phase 3 files. Those existing changes were preserved.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Admins can now enter a schedule-detail assignment workflow from the list page and exercise the Phase 3 draft-save and confirm backends through UI.
- Any follow-up visual polish can build on the new split of summary, applicant controls, and sticky actions without changing the backend contract.

---
*Phase: 03-assignment-and-pay-preview*
*Completed: 2026-03-31*

## Self-Check: PASSED

FOUND: .planning/phases/03-assignment-and-pay-preview/03-assignment-and-pay-preview-03-SUMMARY.md
FOUND: src/app/admin/schedules/[scheduleId]/page.tsx
FOUND: src/flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage.tsx
FOUND: src/flows/admin-schedule-assignment/components/ApplicantAssignmentPanel.tsx
FOUND: src/flows/admin-schedule-assignment/components/ConfirmAssignmentsDialog.tsx

Commit checks skipped intentionally because this execution was explicitly run without git commits.
