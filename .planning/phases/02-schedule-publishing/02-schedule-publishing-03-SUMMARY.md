---
phase: 02-schedule-publishing
plan: 03
subsystem: ui
tags: [nextjs, react, supabase, rls, server-actions, vitest]
requires:
  - phase: 02-01
    provides: schedule tables, recruiting status defaults, and RLS policies for worker schedule access
provides:
  - Worker recruiting schedule read model filtered to recruiting schedules
  - Worker-specific applied-state lookup for schedule applications
  - RLS-backed one-click schedule application mutation and submit wrapper
  - Thin `/worker/schedules` route with a minimal list-first recruiting UI
affects: [phase-03-assignment, worker-ui, schedule-applications]
tech-stack:
  added: []
  patterns: [server-first worker flow composition, RLS-backed worker writes, list-first worker schedule UI]
key-files:
  created:
    - src/queries/schedule/dal/listRecruitingSchedules.ts
    - src/queries/application/dal/listMyScheduleApplicationIds.ts
    - src/mutations/application/dal/scheduleApplicationDal.ts
    - src/mutations/application/actions/createScheduleApplication.ts
    - src/mutations/application/actions/submitScheduleApplication.ts
    - src/mutations/application/components/ApplyToScheduleButton.tsx
    - src/flows/worker-schedules/components/WorkerSchedulesPage.tsx
    - src/flows/worker-schedules/components/WorkerScheduleList.tsx
    - src/app/worker/schedules/page.tsx
  modified:
    - src/queries/schedule/dal/listRecruitingSchedules.test.ts
    - src/mutations/application/actions/createScheduleApplication.test.ts
    - src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx
key-decisions:
  - Keep the worker recruiting DTO local to the worker query slice instead of reusing admin list types.
  - Use `getServerSupabaseClient()` for worker reads and writes so RLS remains the safety boundary.
  - Translate unique insert conflicts into a stable `already_applied` mutation result instead of surfacing raw database errors.
patterns-established:
  - Pattern 1: Worker page flows load current-user state and merge lightweight read models on the server before rendering.
  - Pattern 2: Mutation-scoped apply UI stays colocated with the application action and submit wrapper.
requirements-completed: [APPL-01, APPL-02]
duration: 12min
completed: 2026-03-31
---

# Phase 2 Plan 3: Worker Recruiting List Summary

**Worker recruiting list with server-side applied-state merge and one-click RLS-backed schedule applications**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-31T06:28:10.4464974Z
- **Completed:** 2026-03-31T06:40:15.9955060Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Added a recruiting-only worker read model and current-worker application-id lookup for lightweight schedule visibility.
- Implemented a worker-only schedule application action backed by `getServerSupabaseClient()` with duplicate-apply normalization.
- Shipped a thin `/worker/schedules` route and minimal list UI that shows date, time, recruiting state, and apply/applied state.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create worker recruiting read contracts and missing test scaffolds** - `fb713bc` (feat)
2. **Task 2: Implement the worker application mutation slice with RLS-backed writes** - `ebabc0e` (test), `b72a429` (feat)
3. **Task 3: Build the lightweight worker schedules page** - `83b5404` (feat)

**Plan metadata:** pending

_Note: Task 2 used TDD with separate RED and GREEN commits._

## Files Created/Modified
- `src/queries/schedule/dal/listRecruitingSchedules.ts` - Recruiting-only worker schedule DTO and query.
- `src/queries/application/dal/listMyScheduleApplicationIds.ts` - Current worker application-id lookup for applied-state merging.
- `src/mutations/application/dal/scheduleApplicationDal.ts` - Recruiting schedule lookup and RLS-backed application insert with duplicate detection.
- `src/mutations/application/actions/createScheduleApplication.ts` - Worker-only mutation that strips extra input and returns `applied` or `already_applied`.
- `src/mutations/application/actions/submitScheduleApplication.ts` - FormData wrapper that revalidates `/worker/schedules`.
- `src/mutations/application/components/ApplyToScheduleButton.tsx` - Mutation-scoped apply control showing apply versus applied state.
- `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` - Server-first worker flow composing schedule and application reads.
- `src/flows/worker-schedules/components/WorkerScheduleList.tsx` - Minimal list-first worker recruiting UI.
- `src/app/worker/schedules/page.tsx` - Thin route delegating to the worker schedules flow.
- `src/queries/schedule/dal/listRecruitingSchedules.test.ts` - Recruiting read contract coverage.
- `src/mutations/application/actions/createScheduleApplication.test.ts` - Worker application mutation behavior coverage.
- `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` - Worker recruiting list and applied-state coverage.

## Decisions Made
- Kept worker recruiting list types local to this plan so the worker path stays dependency-safe and intentionally minimal.
- Used session-bound server Supabase clients for worker reads and writes instead of the admin client.
- Returned a stable already-applied outcome from the mutation to keep duplicate submits idempotent at the UX layer.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The `apply_patch` edit tool failed in this environment, so file creation and edits were completed with direct PowerShell writes and then verified with targeted tests.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 3 can build applicant review and assignment flows on top of the new schedule-level application records.
- Worker schedule visibility and apply state now exist as a stable base contract for richer worker-facing views if later phases need them.

## Self-Check: PASSED

