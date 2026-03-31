---
phase: 02-schedule-publishing
plan: 01
subsystem: database
tags: [supabase, postgres, nextjs, zod, vitest, schedule]
requires:
  - phase: 01-access-foundation
    provides: role-backed Supabase auth, user_roles lookups, and thin admin route conventions
provides:
  - Phase 2 schedule tables, enum, indexes, RLS policies, and atomic create RPC
  - Admin-only schedule creation schema, DAL, and server actions
  - Thin /admin/schedules route with a repeatable role-slot creation form
affects: [schedule-publishing, worker-applications, admin-operations]
tech-stack:
  added: []
  patterns:
    - Atomic schedule plus role-slot persistence through a Supabase RPC
    - Strict DB-backed admin authorization for privileged writes
    - Thin App Router route delegating to one admin flow
key-files:
  created:
    - supabase/migrations/20260401_phase2_schedule_publishing.sql
    - src/shared/model/schedule.ts
    - src/mutations/schedule/dal/scheduleDal.ts
    - src/mutations/schedule/actions/createSchedule.ts
    - src/queries/access/dal/requireAdminUser.ts
    - src/flows/admin-schedules/components/AdminSchedulesPage.tsx
  modified:
    - src/mutations/schedule/schemas/schedule.ts
    - src/mutations/schedule/schemas/schedule.test.ts
    - src/mutations/schedule/dal/scheduleDal.test.ts
    - src/mutations/schedule/actions/createSchedule.test.ts
    - src/mutations/schedule/actions/submitSchedule.ts
    - src/app/admin/schedules/page.tsx
key-decisions:
  - "Normalize date and time form input into +09:00 schedule timestamps before persistence."
  - "Use a DB-backed requireAdminUser guard for privileged schedule writes instead of metadata fallbacks."
patterns-established:
  - "Schedule creation actions validate with Zod, authorize via user_roles, then persist through a single RPC."
  - "Admin schedule UI keeps the route thin and owns create-form composition in flows."
requirements-completed: [SCHD-01, SCHD-02]
duration: 5 min
completed: 2026-03-31
---

# Phase 02 Plan 01: Schedule Publishing Summary

**Atomic admin schedule creation with role-slot headcounts, strict admin authorization, and a thin `/admin/schedules` flow**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-31T15:11:28+09:00
- **Completed:** 2026-03-31T15:16:33+09:00
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Added the minimal Phase 2 Supabase schedule model with `schedules`, `schedule_role_slots`, `schedule_applications`, RLS, indexes, and `create_schedule_with_slots`.
- Implemented admin schedule creation with normalized form parsing, DB-backed admin enforcement, atomic RPC persistence, and `/admin/schedules` revalidation.
- Added the first admin schedules route and a repeatable role-slot form wired to the new mutation path.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the Phase 2 database contract and test scaffolding** - `1aa6aa6` (feat)
2. **Task 2: Implement the admin schedule creation mutation slice** - `f5b2dd2` (test), `0fb0027` (feat)
3. **Task 3: Add the thin admin route and create-focused flow shell** - `6768a6e` (feat)

**Plan metadata:** pending final docs commit

## Files Created/Modified
- `supabase/migrations/20260401_phase2_schedule_publishing.sql` - Minimal Phase 2 schedule schema, constraints, indexes, RLS, and atomic create RPC.
- `src/shared/model/schedule.ts` - Shared schedule status and role-slot DTO contracts.
- `src/mutations/schedule/schemas/schedule.ts` - Zod parsing and normalization from admin form input into persistence payloads.
- `src/mutations/schedule/dal/scheduleDal.ts` - Service-role RPC wrapper for atomic schedule-plus-slot writes.
- `src/mutations/schedule/actions/createSchedule.ts` - Admin-only schedule creation action.
- `src/mutations/schedule/actions/submitSchedule.ts` - FormData submit wrapper with `/admin/schedules` revalidation.
- `src/queries/access/dal/requireAdminUser.ts` - Strict DB-backed admin guard against `user_roles`.
- `src/flows/admin-schedules/components/AdminSchedulesPage.tsx` - Admin flow shell for schedule creation.
- `src/flows/admin-schedules/components/CreateScheduleForm.tsx` - Simple repeatable role-slot creation form.
- `src/app/admin/schedules/page.tsx` - Thin App Router entrypoint.

## Decisions Made
- Normalized admin date and time input into explicit `+09:00` timestamps so one schedule record can be created from the venue-facing form fields without ambiguous time zones.
- Kept privileged schedule writes on a strict `user_roles` lookup via `requireAdminUser()` instead of reusing `getCurrentUser()` metadata fallbacks.
- Returned role-slot data from the DAL using the validated input payload while the RPC owns transactional schedule row creation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `apply_patch` failed repeatedly with a Windows sandbox refresh error, so file creation and edits were completed with PowerShell `Set-Content` as a tooling workaround.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ready for the follow-up plan that fills in admin schedule listing/status management and worker-facing recruiting/application flows.
- The Phase 2 create path is narrow by design: there is no edit-after-create, role assignment, or review workflow yet.

## Self-Check: PASSED

- FOUND: .planning/phases/02-schedule-publishing/02-schedule-publishing-01-SUMMARY.md
- FOUND: 1aa6aa6
- FOUND: f5b2dd2
- FOUND: 0fb0027
- FOUND: 6768a6e
