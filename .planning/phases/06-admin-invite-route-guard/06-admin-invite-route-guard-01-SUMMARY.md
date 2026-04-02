---
phase: 06-admin-invite-route-guard
plan: 01
subsystem: testing
tags: [vitest, nextjs, auth, admin, regression]
requires:
  - phase: 05-operations-dashboard
    provides: admin route guard test style and thin-route coverage pattern
provides:
  - failing-first regression coverage for the `/admin/invites` admin guard gap
  - thin-route test coverage proving the route must call `requireAdminUser`
affects: [phase-06-plan-02, admin-invites, auth-hardening]
tech-stack:
  added: []
  patterns: [async server-component Vitest coverage, thin-route guard regression tests]
key-files:
  created: [src/flows/admin-invites/components/AdminInvitesPage.test.tsx]
  modified: []
key-decisions:
  - "Keep Phase 06 Plan 01 as a pure RED task so the missing route guard is executable before implementation begins."
  - "Reuse the existing admin dashboard test style and mock `requireAdminUser` directly instead of inventing invite-specific test helpers."
patterns-established:
  - "Guard regressions for admin routes should live beside the flow component and import the real thin route entry."
  - "Denied-access tests must assert that privileged controls are absent, not only that copy appears."
requirements-completed: []  # Wave 0 coverage only; AUTH-01 and AUTH-03 remain open until Plan 02 lands.
duration: 7min
completed: 2026-04-02
---

# Phase 06 Plan 01: Admin Invite Route Guard Summary

**Failing-first Vitest coverage now proves `/admin/invites` still leaks admin UI to unguarded sessions until the route guard is implemented**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-02T11:15:00Z
- **Completed:** 2026-04-02T11:22:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added a colocated Wave 0 regression file for `AdminInvitesPage`.
- Covered admin success, denied access, and thin-route guard wiring in one targeted test suite.
- Verified the suite fails for the expected reasons: denied copy is missing and the thin route never calls `requireAdminUser`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Write the failing-first invite-route regression test file** - `21779a3` (test)

## Files Created/Modified
- `src/flows/admin-invites/components/AdminInvitesPage.test.tsx` - Failing-first admin invite route regression coverage.

## Decisions Made
- Keep this plan scoped to RED-only test creation so Plan 02 can implement the guard against an executable failure.
- Match the established admin dashboard test structure to keep async server-component route tests consistent across admin entry points.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `pnpm exec vitest run src/flows/admin-invites/components/AdminInvitesPage.test.tsx` failed in the expected RED state because `AdminInvitesPage` does not yet handle rejected `requireAdminUser()` calls and `/admin/invites` does not invoke the guard.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02 can now add `requireAdminUser()` to the invite flow and use this suite as the immediate regression gate.
- AUTH-01 and AUTH-03 are not complete yet; this plan only established the failing harness.

## Self-Check: PASSED

---
*Phase: 06-admin-invite-route-guard*
*Completed: 2026-04-02*
