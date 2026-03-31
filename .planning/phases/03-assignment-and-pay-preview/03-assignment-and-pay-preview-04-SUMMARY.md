---
phase: 03-assignment-and-pay-preview
plan: 04
subsystem: ui
tags: [nextjs, supabase, worker, assignments, pay-preview]
requires:
  - phase: 03-assignment-and-pay-preview
    provides: assignment persistence, confirmed assignment policies, and worker-confirmed cache tags
provides:
  - canonical worker pay preview utility
  - confirmed worker assignment read model
  - worker confirmed assignments route and page
affects: [phase-03, worker-ui, payroll-preview]
tech-stack:
  added: []
  patterns: [server-first worker query, canonical TypeScript pay calculation, tag-keyed confirmed assignment caching]
key-files:
  created:
    - src/queries/assignment/utils/calculatePayPreview.ts
    - src/queries/assignment/dal/listConfirmedWorkerAssignments.ts
    - src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx
    - src/app/worker/assignments/page.tsx
  modified:
    - src/flows/worker-shell/components/WorkerShellPage.tsx
    - src/flows/worker-shell/components/WorkerShellPage.test.tsx
key-decisions:
  - "Worker confirmed assignment reads stay on the session-bound Supabase client and filter to confirmed rows only."
  - "Pay preview uses one shared TypeScript calculation path instead of duplicating overtime math in UI or SQL."
  - "Confirmed work lives on /worker/assignments so recruiting and confirmed payroll concerns stay separate."
patterns-established:
  - "Worker confirmed-work pages should derive totals from query-slice preview rows rather than reimplement payroll math in components."
  - "Worker navigation can expose recruiting and confirmed-work routes side by side without mixing their data models."
requirements-completed: [ASGN-03, PAY-02, PAY-03, PAY-04]
duration: 6 min
completed: 2026-03-31
---

# Phase 03 Plan 04: Worker Confirmed Assignment Preview Summary

**Worker-facing confirmed assignments now render from one RLS-safe read path with a single overtime-aware pay formula and a dedicated `/worker/assignments` route.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-31T09:04:00Z
- **Completed:** 2026-03-31T09:10:24Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Added `calculatePayPreview` as the canonical confirmed-work pay formula with the 9-hour regular / 1.5x overtime split.
- Added `listConfirmedWorkerAssignments` as the worker-scoped confirmed assignment query using the session-bound Supabase client and assignment cache tags.
- Built the `/worker/assignments` route, page, total-pay card, confirmed assignment list, and worker-shell navigation link.

## Task Commits

Not created. The user explicitly requested no git commits and no push for this execution.

## Files Created/Modified
- `src/queries/assignment/types/workerAssignmentPreview.ts` - Worker-facing confirmed assignment and pay-preview contract.
- `src/queries/assignment/utils/calculatePayPreview.ts` - Canonical regular/overtime pay calculation utility.
- `src/queries/assignment/utils/calculatePayPreview.test.ts` - Unit coverage for regular, overtime, and invalid-window behavior.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.ts` - Session-bound confirmed assignment read model with cache tags.
- `src/queries/assignment/dal/listConfirmedWorkerAssignments.test.ts` - Query coverage for confirmed-only filtering and pay mapping.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.tsx` - Worker page flow with total pay, calculation basis, and confirmed list order.
- `src/flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage.test.tsx` - Rendering coverage for populated and empty worker preview states.
- `src/flows/worker-assignment-preview/components/ConfirmedAssignmentList.tsx` - Summary card list for confirmed assignments.
- `src/flows/worker-assignment-preview/components/PayPreviewTotalCard.tsx` - Single total expected pay card.
- `src/app/worker/assignments/page.tsx` - Thin worker route entry for confirmed assignments.
- `src/flows/worker-shell/components/WorkerShellPage.tsx` - Worker navigation now links to confirmed work separately from recruiting schedules.
- `src/flows/worker-shell/components/WorkerShellPage.test.tsx` - Navigation coverage for the worker shell.

## Decisions Made
- Kept the worker confirmed-work query on direct base tables with the session-bound Supabase client so RLS remains the safety boundary.
- Centralized the pay preview formula in the query slice so totals and per-assignment breakdowns cannot drift.
- Added a dedicated `/worker/assignments` route instead of mixing confirmed work into `/worker/schedules`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Worker-facing confirmed assignment and pay preview requirements are covered for Phase 3.
- Phase 03 still has unresolved plans `03-02` and `03-03`; they can build on the new worker route and canonical pay-preview read path.

---
*Phase: 03-assignment-and-pay-preview*
*Completed: 2026-03-31*
