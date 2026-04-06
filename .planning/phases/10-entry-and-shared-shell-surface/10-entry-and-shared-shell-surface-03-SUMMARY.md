---
phase: 10-entry-and-shared-shell-surface
plan: 03
subsystem: ui
tags: [nextjs, ui, shell, navigation, admin, worker]
requires:
  - phase: 01-access-foundation
    provides: role-aware auth and thin route conventions for admin and worker areas
  - phase: 05-operations-dashboard
    provides: the existing admin operations dashboard implementation reused under /admin/operations
provides:
  - role-aware copy on the common home for worker and admin users
  - card-based worker landing shell for schedules and confirmed work
  - admin landing shell plus a thin /admin/operations route for the existing dashboard
affects: [phase-10, admin-shell, worker-shell, home-navigation]
tech-stack:
  added: []
  patterns:
    - card-based landing shells for role entry routes
    - thin route handoff from /admin to a dedicated shell while preserving dashboard access under a child route
key-files:
  created:
    - src/app/admin/operations/page.tsx
  modified:
    - src/flows/auth-shell/components/RootRedirectPage.tsx
    - src/flows/auth-shell/components/RootRedirectPage.test.tsx
    - src/flows/worker-shell/components/WorkerShellPage.tsx
    - src/flows/worker-shell/components/WorkerShellPage.test.tsx
    - src/app/admin/page.tsx
    - src/flows/admin-shell/components/AdminShellPage.tsx
    - src/flows/admin-shell/components/AdminShellPage.test.tsx
key-decisions:
  - "Kept / as the auth and role gatekeeper, but made its copy explicitly role-aware instead of generic."
  - "Moved the existing operations dashboard behind /admin/operations so /admin can become the real admin landing shell."
patterns-established:
  - "Role routes should present card-based next-step navigation instead of raw link lists or placeholder text."
  - "Existing heavy admin surfaces can move behind thin child routes when the top-level admin route needs a dedicated home."
requirements-completed: [ENTRY-03, ENTRY-04]
duration: 6min
completed: 2026-04-06
---

# Phase 10 Plan 03: Entry And Shared Shell Surface Summary

**The common home, worker route, and admin route now present role-aware landing shells, and the operations dashboard stays reachable through a thin admin child route**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-06T19:50:00+09:00
- **Completed:** 2026-04-06T19:56:00+09:00
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added role-aware copy to the common home so admins and workers see clearer next-step guidance after sign-in.
- Rebuilt `/worker` as a card-based workspace with clearer scheduling and confirmed-work entry points.
- Turned `/admin` into a real admin landing shell and preserved the existing operations dashboard behind `/admin/operations`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade the common home and worker shell into readable role-aware landing surfaces** - `3a23bed` (feat)
2. **Task 2: Turn /admin into a real admin landing shell and preserve dashboard access through a thin child route** - `8d0edf6` (feat)

## Files Created/Modified

- `src/flows/auth-shell/components/RootRedirectPage.tsx` - Role-aware signed-in copy and clearer admin workspace handoff.
- `src/flows/auth-shell/components/RootRedirectPage.test.tsx` - Verifies the updated copy and admin link label while preserving redirect coverage.
- `src/flows/worker-shell/components/WorkerShellPage.tsx` - Card-based worker workspace with clearer next-step guidance.
- `src/flows/worker-shell/components/WorkerShellPage.test.tsx` - Confirms denial state and worker destination links.
- `src/app/admin/page.tsx` - Routes `/admin` to the admin landing shell instead of the dashboard directly.
- `src/app/admin/operations/page.tsx` - Thin child route for the existing operations dashboard.
- `src/flows/admin-shell/components/AdminShellPage.tsx` - New admin landing shell with schedules, operations, invites, and worker-rate destinations.
- `src/flows/admin-shell/components/AdminShellPage.test.tsx` - Verifies denial state and the four admin destination links.

## Decisions Made

- Reserved `/admin` for the workspace landing shell so the dashboard is no longer the only first impression for admins.
- Kept the common-home heading stable and improved clarity through role-aware supporting copy rather than redirecting users into an entirely new home pattern.

## Deviations from Plan

### Auto-fixed Issues

**1. [Verification follow-up] Realigned legacy dashboard thin-route coverage after the `/admin` handoff**
- **Found during:** phase-level full-suite verification
- **Issue:** Existing operations-dashboard tests still treated `/admin` as the thin dashboard route, which no longer matched the new admin landing-shell ownership.
- **Fix:** Updated `src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` so the thin-route assertions target `/admin/operations`.
- **Verification:** `pnpm exec vitest run src/flows/admin-operations-dashboard/components/AdminOperationsDashboardPage.test.tsx` and `pnpm exec vitest run`
- **Committed in:** pending final phase closeout commit

---

**Total deviations:** 1 auto-fixed follow-up
**Impact on plan:** The `/admin` landing-shell handoff remains intact, and the existing dashboard regression coverage now matches the shipped route structure.

## Issues Encountered

- One existing dashboard test contract still pointed at `/admin` after the admin-home route handoff. The test was updated during phase-level verification so the suite matched the new `/admin` -> shell, `/admin/operations` -> dashboard split.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 10 is ready for phase-level verification and live browser review of Google OAuth, invite continuity, and route-state behavior.
- Phase 11 can now build on a stable shared entry and shell language instead of starting from raw route scaffolds.

## Self-Check: PASSED

---
*Phase: 10-entry-and-shared-shell-surface*
*Completed: 2026-04-06*
