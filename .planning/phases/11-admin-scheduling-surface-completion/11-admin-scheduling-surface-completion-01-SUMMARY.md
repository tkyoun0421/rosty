---
phase: 11-admin-scheduling-surface-completion
plan: 01
subsystem: ui
tags: [nextjs, ui, admin-schedules, forms, schedule-management]
requires:
  - phase: 10-entry-and-shared-shell-surface
    provides: admin workspace card language and thin route ownership
provides:
  - readable admin schedule creation form with role-slot controls
  - saved schedule cards with status, staffing summary, and detail handoff
  - regression coverage for the admin schedule creation and management surfaces
affects: [phase-11, admin-schedules, assignment-detail, operations-dashboard]
tech-stack:
  added: []
  patterns:
    - shared Card and Button primitives for admin schedule creation and list management
    - card-row presentation for schedule summaries instead of raw browser tables
key-files:
  created:
    - src/flows/admin-schedules/components/CreateScheduleForm.test.tsx
    - src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx
  modified:
    - src/flows/admin-schedules/components/CreateScheduleForm.tsx
    - src/flows/admin-schedules/components/AdminSchedulesPage.tsx
    - src/flows/admin-schedules/components/ScheduleTable.tsx
    - src/flows/admin-schedules/components/ScheduleStatusForm.tsx
    - src/flows/admin-schedules/utils/formatSchedule.ts
key-decisions:
  - "Kept the existing submitSchedule and submitScheduleStatus server-action contracts untouched and focused all changes in the flow components."
  - "Moved the saved schedule presentation from a raw table to card rows so the admin list stays readable on narrow screens and aligned with the Phase 10 workspace language."
patterns-established:
  - "Admin schedule surfaces should use card sections with explicit next-step copy instead of raw fieldsets or tables."
  - "Confirmed schedules stay read-only on the list surface and only expose drill-down into assignment detail."
requirements-completed: [ADMINUI-01, ADMINUI-02]
duration: 5min
completed: 2026-04-06
---

# Phase 11 Plan 01: Admin Scheduling Surface Completion Summary

**Readable schedule creation and saved-schedule management now share one admin workspace, with role-slot editing, status context, and detail drill-down preserved on the existing contracts**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-06T20:40:50+09:00
- **Completed:** 2026-04-06T20:45:41+09:00
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Rebuilt the schedule creation form as a card-based surface with labeled date and time fields, explicit role-slot controls, and a clear recruiting-state explanation.
- Replaced the raw saved-schedules table with stacked schedule cards that expose timing, staffing summary, status badges, inline status changes, and assignment-detail handoff.
- Added regression coverage for the creation surface, the admin schedule workspace shell, the empty state, and confirmed-schedule read-only behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild the schedule creation surface and role-slot editor** - `680db8f` (feat)
2. **Task 2: Rebuild the saved-schedules surface and inline status controls** - `93580de` (feat)

## Files Created/Modified

- `src/flows/admin-schedules/components/CreateScheduleForm.tsx` - Card-based schedule creation form that preserves the existing field names and submit action.
- `src/flows/admin-schedules/components/CreateScheduleForm.test.tsx` - Render regression for labels, supporting copy, role-slot controls, and submit text.
- `src/flows/admin-schedules/components/AdminSchedulesPage.tsx` - Full admin schedule-management workspace with denial, creation, and saved-schedule sections.
- `src/flows/admin-schedules/components/ScheduleTable.tsx` - Stacked saved-schedule cards with status badges, staffing summary, and detail links.
- `src/flows/admin-schedules/components/ScheduleStatusForm.tsx` - Inline status control using the shared Button primitive and existing submit wrapper.
- `src/flows/admin-schedules/components/AdminSchedulesPage.test.tsx` - Workspace regression covering heading, empty state, detail link, and confirmed-schedule behavior.
- `src/flows/admin-schedules/utils/formatSchedule.ts` - Shared schedule-window and staffing-summary helpers for the refreshed saved-schedule surface.

## Decisions Made

- Kept all write behavior routed through the existing schedule submit wrappers so this plan stayed surface-only and did not widen into schedule action refactoring.
- Treated confirmed schedules as read-only on the list view and pushed deeper edits to the existing detail route to preserve route ownership.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 can reuse the same card language and status/facts hierarchy when rebuilding schedule detail and assignment review.
- The operations dashboard can now point back into a readable `/admin/schedules` surface once Plan 03 aligns the dashboard shell and CTA language.

## Self-Check: PASSED

---
*Phase: 11-admin-scheduling-surface-completion*
*Completed: 2026-04-06*
