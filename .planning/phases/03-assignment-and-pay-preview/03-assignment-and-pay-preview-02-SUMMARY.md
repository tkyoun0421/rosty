---
phase: 03-assignment-and-pay-preview
plan: 02
subsystem: api
tags: [nextjs, supabase, postgres, server-actions, vitest, cache-tags]
requires:
  - phase: 03-01
    provides: assignment draft persistence, admin schedule-detail reads, and assignment cache tags
provides:
  - Dedicated explicit confirm mutation for draft assignments
  - Atomic schedule publication path that confirms assignment rows and the parent schedule together
  - Hardened schedule-list status mutation that cannot publish or reopen confirmed schedules
affects: [phase-03-admin-assignment-ui, phase-03-worker-confirmed-assignments, worker-pay-preview]
tech-stack:
  added: []
  patterns: [rpc-backed assignment confirmation, per-worker cache publication, backend-enforced lightweight schedule status transitions]
key-files:
  created:
    - src/mutations/assignment/schemas/confirmScheduleAssignments.ts
    - src/mutations/assignment/schemas/confirmScheduleAssignments.test.ts
    - src/mutations/assignment/actions/confirmScheduleAssignments.ts
    - src/mutations/assignment/actions/confirmScheduleAssignments.test.ts
    - src/mutations/assignment/actions/submitScheduleAssignmentConfirm.ts
  modified:
    - src/mutations/assignment/dal/assignmentDal.ts
    - src/mutations/assignment/dal/assignmentDal.test.ts
    - src/mutations/schedule/schemas/updateScheduleStatus.ts
    - src/mutations/schedule/actions/updateScheduleStatus.test.ts
    - src/mutations/schedule/dal/scheduleDal.ts
    - src/mutations/schedule/dal/scheduleDal.test.ts
    - src/flows/admin-schedules/components/ScheduleStatusForm.tsx
    - src/flows/admin-schedules/components/ScheduleTable.tsx
    - src/flows/admin-schedules/utils/formatSchedule.ts
    - src/shared/config/cacheTags.ts
    - supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql
key-decisions:
  - Use a Postgres RPC to confirm draft assignments and publish schedule status in one transactional write path.
  - Treat the schedule-list status mutation as a lightweight recruiting/assigning control only and lock confirmed schedules from that path.
  - Revalidate per-worker confirmed-assignment and pay-preview tags on publish so worker-facing reads refresh immediately after confirmation.
patterns-established:
  - Pattern 1: Final assignment publication happens through a dedicated confirm action, never through the generic status mutation.
  - Pattern 2: List-page schedule status controls render only operational transitions and hide inline controls for confirmed schedules.
requirements-completed: [ASGN-02]
duration: 12min
completed: 2026-03-31
---

# Phase 3 Plan 2: Assignment And Pay Preview Summary

**Explicit assignment confirmation now publishes confirmed rows and schedule status together while the older list-page status path is constrained to non-publication transitions**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-31T17:59:30+09:00
- **Completed:** 2026-03-31T18:11:49+09:00
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Added a dedicated `confirmScheduleAssignments` backend workflow with its own input schema, submit wrapper, DAL helper, and tests.
- Published draft assignments through an atomic database function that stamps confirmation metadata, sets `schedules.status = 'confirmed'`, and returns unfilled-slot summary data without blocking partial confirmation.
- Closed the Phase 2 publication bypass by removing `confirmed` from the generic list-page status path and locking confirmed schedules from lightweight status edits.

## Task Commits

Skipped by request. The user explicitly required no git commits or pushes for this execution.

## Files Created/Modified
- `src/mutations/assignment/schemas/confirmScheduleAssignments.ts` - Parses exactly `scheduleId` for the explicit confirm workflow.
- `src/mutations/assignment/dal/assignmentDal.ts` - Adds the confirm DAL helper and unfilled-slot summary logic on top of the draft-save path.
- `src/mutations/assignment/actions/confirmScheduleAssignments.ts` - Enforces admin-only confirm orchestration and worker/admin cache invalidation.
- `src/mutations/assignment/actions/submitScheduleAssignmentConfirm.ts` - `FormData` submit wrapper for the dedicated confirm action.
- `src/shared/config/cacheTags.ts` - Adds worker pay-preview invalidation tags alongside confirmed-assignment tags.
- `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql` - Adds the transactional `confirm_schedule_assignments` RPC needed to publish rows and schedule state together.
- `src/mutations/schedule/schemas/updateScheduleStatus.ts` - Restricts list-page target statuses to `recruiting` and `assigning`.
- `src/mutations/schedule/dal/scheduleDal.ts` - Locks confirmed schedules from the generic status path even if the UI is bypassed.
- `src/flows/admin-schedules/components/ScheduleStatusForm.tsx` - Removes inline publish controls and hides status actions for confirmed rows.
- `src/flows/admin-schedules/components/ScheduleTable.tsx` - Keeps the list page aligned with the hardened status-control behavior.

## Decisions Made
- Used a DB function rather than chained client updates so assignment-row confirmation and schedule publication are truly atomic.
- Allowed partial confirmation to proceed while returning `unfilledSlotIds`, matching the phase research recommendation instead of adding a hidden fill-all prerequisite.
- Considered confirmed schedules immutable from the old list-page mutation path; any final publication must now come from the explicit confirm workflow.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added a database RPC for transactional confirmation**
- **Found during:** Task 1 (Implement the dedicated confirm mutation and cache publication path)
- **Issue:** The existing Supabase DAL could not update assignment rows and `schedules.status` in one real transaction.
- **Fix:** Extended `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql` with `confirm_schedule_assignments(uuid, uuid)` and routed the confirm DAL through that RPC.
- **Files modified:** `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql`, `src/mutations/assignment/dal/assignmentDal.ts`, `src/mutations/assignment/dal/assignmentDal.test.ts`
- **Verification:** `pnpm test -- src/mutations/assignment/schemas/confirmScheduleAssignments.test.ts src/mutations/assignment/dal/assignmentDal.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts`
- **Committed in:** None - commits were explicitly disabled by user instruction.

**2. [Rule 2 - Missing Critical] Hardened the schedule DAL in addition to the action/schema layer**
- **Found during:** Task 2 (Harden the Phase 2 schedule status path so only explicit confirm can publish `confirmed`)
- **Issue:** Rejecting `confirmed` only in the action/schema would still leave the underlying DAL able to publish or reopen confirmed schedules if another caller reused it.
- **Fix:** Narrowed the generic DAL to lightweight statuses only and added a lock for already confirmed schedules.
- **Files modified:** `src/mutations/schedule/dal/scheduleDal.ts`, `src/mutations/schedule/dal/scheduleDal.test.ts`, `src/mutations/schedule/schemas/updateScheduleStatus.ts`, `src/mutations/schedule/actions/updateScheduleStatus.test.ts`
- **Verification:** `pnpm test -- src/mutations/assignment/schemas/confirmScheduleAssignments.test.ts src/mutations/assignment/dal/assignmentDal.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts`
- **Committed in:** None - commits were explicitly disabled by user instruction.

**3. [Rule 3 - Blocking] `apply_patch` was unavailable in this environment**
- **Found during:** Task 1 implementation
- **Issue:** The mandated patch tool failed with a Windows sandbox refresh error before file edits could be applied.
- **Fix:** Completed the required file updates with direct PowerShell writes and then re-ran the targeted verification suite.
- **Files modified:** All runtime and planning files touched in this plan.
- **Verification:** `pnpm test -- src/mutations/assignment/schemas/confirmScheduleAssignments.test.ts src/mutations/assignment/dal/assignmentDal.test.ts src/mutations/assignment/actions/confirmScheduleAssignments.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts`
- **Committed in:** None - commits were explicitly disabled by user instruction.

---

**Total deviations:** 3 auto-fixed (2 missing critical, 1 blocking)
**Impact on plan:** The extra DAL and migration work was necessary to make the explicit confirm flow actually authoritative and transactional. No user-facing scope was added beyond the requested publication hardening.

## Issues Encountered
- The worktree was already dirty before execution and included unrelated Phase 3 changes. Those files were preserved and not reverted.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 03-03 can build the admin detail confirm UI on top of the dedicated backend confirm action instead of reusing the generic status mutation.
- Plan 03-04 can rely on immediate worker-side tag invalidation for confirmed assignments and pay preview reads after publication.
- The migration must be applied before runtime verification against a real Supabase database, because the new confirm action depends on `public.confirm_schedule_assignments`.

---
*Phase: 03-assignment-and-pay-preview*
*Completed: 2026-03-31*

## Self-Check: PASSED

FOUND: .planning/phases/03-assignment-and-pay-preview/03-assignment-and-pay-preview-02-SUMMARY.md
FOUND: src/mutations/assignment/actions/confirmScheduleAssignments.ts
FOUND: src/mutations/assignment/schemas/confirmScheduleAssignments.ts
FOUND: src/mutations/assignment/actions/submitScheduleAssignmentConfirm.ts

Commit checks skipped intentionally because this execution was explicitly run without git commits.

