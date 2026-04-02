---
phase: 06-admin-invite-route-guard
plan: 02
subsystem: auth
tags: [nextjs, vitest, supabase, route-guard, admin]
requires:
  - phase: 06-admin-invite-route-guard
    provides: "Invite route guard regression coverage from plan 01"
provides:
  - "Guarded admin invite flow entry using requireAdminUser"
  - "Async thin /admin/invites route that delegates to the guarded flow"
  - "Passing regression coverage for denied and allowed invite route access"
affects: [admin-invites, access-control, auth]
tech-stack:
  added: []
  patterns: ["Guard admin read routes inside flow components with requireAdminUser while keeping src/app routes thin"]
key-files:
  created: []
  modified:
    - src/flows/admin-invites/components/AdminInvitesPage.tsx
    - src/app/admin/invites/page.tsx
    - src/flows/admin-invites/components/AdminInvitesPage.test.tsx
key-decisions:
  - "Kept the admin check inside AdminInvitesPage so /admin/invites stays declarative and consistent with other admin routes."
  - "Reused the existing inline forbidden copy instead of widening scope into Next.js forbidden() handling."
patterns-established:
  - "Admin invite screens must await requireAdminUser before returning privileged JSX."
  - "Thin app routes should return await FlowPage() rather than embedding access logic."
requirements-completed: [AUTH-01, AUTH-03]
duration: 3min
completed: 2026-04-02
---

# Phase 06 Plan 02: Admin Invite Route Guard Summary

**DB-backed admin gating now blocks non-admin access to `/admin/invites` before invite controls render while preserving the existing invite action wiring**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-02T11:25:41Z
- **Completed:** 2026-04-02T11:27:38Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Added the strict `requireAdminUser()` gate to `AdminInvitesPage` before any privileged invite UI renders.
- Kept `src/app/admin/invites/page.tsx` as an async thin route that delegates directly to the flow.
- Locked the route contract with regression coverage for admin access, denied access, and thin-route source shape.

## Task Commits

Each task was committed atomically:

1. **Task 1: Guard the invite flow with `requireAdminUser()` and keep the route thin** - `18e8c6a` (test), `b2bf370` (feat)

**Plan metadata:** pending docs commit

_Note: TDD task used separate red and green commits._

## Files Created/Modified
- `src/flows/admin-invites/components/AdminInvitesPage.tsx` - Awaits `requireAdminUser()` and returns the existing invite form only for admins.
- `src/app/admin/invites/page.tsx` - Async thin route entry returning `await AdminInvitesPage()`.
- `src/flows/admin-invites/components/AdminInvitesPage.test.tsx` - Regression coverage for allowed access, denied access, and thin-route source assertions.

## Decisions Made

- Kept auth enforcement in the flow component to match the repo's established admin route pattern.
- Preserved the inline `Admin access required.` response so this plan stays focused on route hardening.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- PowerShell output still displayed mojibake for some repository text, so test assertions were aligned to the actual rendered UI strings observed in Vitest output.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/admin/invites` now rejects worker or anonymous sessions before invite-management controls render.
- The targeted regression and the full Vitest suite both pass, so the auth-hardening change is ready for downstream verification work.

## Self-Check: PASSED

---
*Phase: 06-admin-invite-route-guard*
*Completed: 2026-04-02*
