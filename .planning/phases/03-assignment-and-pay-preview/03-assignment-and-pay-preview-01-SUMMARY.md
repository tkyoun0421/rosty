---
phase: 03-assignment-and-pay-preview
plan: 01
subsystem: database
tags: [nextjs, supabase, postgres, rls, server-actions, vitest]
requires:
  - phase: 02-01
    provides: schedules, role slots, and recruiting/confirmed schedule states
  - phase: 02-03
    provides: schedule-level applications and worker-side RLS patterns
provides:
  - Assignment persistence with draft and confirmed row contracts
  - Admin schedule-detail read model with applicant assignment-state derivation
  - Whole-schedule draft-save schema, DAL, and admin-only server action
  - Worker-safe confirmed-read database policies for assignment and pay preview follow-up work
affects: [phase-03-confirmation, admin-assignment-ui, worker-pay-preview]
tech-stack:
  added: []
  patterns: [schedule-centered assignment reads, whole-schedule draft replacement writes, direct RLS-backed confirmed worker reads]
key-files:
  created:
    - supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql
    - src/shared/model/assignment.ts
    - src/shared/model/assignment.test.ts
    - src/queries/assignment/types/adminScheduleAssignmentDetail.ts
    - src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts
    - src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts
    - src/mutations/assignment/schemas/saveScheduleAssignmentDraft.ts
    - src/mutations/assignment/schemas/saveScheduleAssignmentDraft.test.ts
    - src/mutations/assignment/dal/assignmentDal.ts
    - src/mutations/assignment/dal/assignmentDal.test.ts
    - src/mutations/assignment/actions/saveScheduleAssignmentDraft.ts
    - src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts
    - src/mutations/assignment/actions/submitScheduleAssignmentDraft.ts
  modified:
    - src/shared/config/cacheTags.ts
key-decisions:
  - Keep Phase 3 worker confirmed reads on direct base-table RLS policies instead of introducing a view or RPC.
  - Derive applicant assignment labels in the admin query mapper so the UI receives render-ready assignment state.
  - Replace a schedule draft by validating the full payload first and then reconciling per-worker draft rows so confirmed rows remain untouched.
patterns-established:
  - Pattern 1: Assignment queries use assignment-specific cache tags instead of broad path invalidation.
  - Pattern 2: Assignment mutations parse `FormData` in schemas and keep server actions orchestration-only.
requirements-completed: [APPL-03, ASGN-01]
duration: 10min
completed: 2026-03-31
---

# Phase 3 Plan 1: Assignment And Pay Preview Summary

**Assignment table foundation with schedule-centered admin review data and whole-schedule draft-save mutations for Phase 3 staffing**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-31T17:46:30+09:00
- **Completed:** 2026-03-31T17:56:44+09:00
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Added the Phase 3 assignment migration with `draft`/`confirmed` status, worker-confirmed read policies, and worker-rate access needed for pay preview follow-up work.
- Implemented the admin schedule-detail read model that returns schedule timing, slot fill counts, applicant rows, and derived applicant assignment labels.
- Implemented whole-schedule draft-save parsing, validation, DAL reconciliation, and an admin-only server action with assignment-detail tag invalidation.

## Task Commits

Skipped by request. The user explicitly required no git commits or pushes for this execution.

## Files Created/Modified
- `supabase/migrations/20260402_phase3_assignment_and_pay_preview.sql` - Assignment enum/table, indexes, RLS policies, and confirmed worker-read contract.
- `src/shared/model/assignment.ts` - Canonical assignment row contract and shared status type.
- `src/shared/config/cacheTags.ts` - Assignment detail and worker confirmed assignment cache tags.
- `src/queries/assignment/types/adminScheduleAssignmentDetail.ts` - Admin detail DTO for schedule-centered applicant review.
- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.ts` - Admin read model with derived applicant status labels and slot fill counts.
- `src/mutations/assignment/schemas/saveScheduleAssignmentDraft.ts` - Whole-schedule payload parsing and duplicate-worker validation.
- `src/mutations/assignment/dal/assignmentDal.ts` - Draft reconciliation write path that validates applicants and slot capacity before persisting.
- `src/mutations/assignment/actions/saveScheduleAssignmentDraft.ts` - Admin-only save action with tag-based revalidation.
- `src/mutations/assignment/actions/submitScheduleAssignmentDraft.ts` - `FormData` wrapper for the draft-save action.
- `src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts` - APPL-03 behavior coverage.
- `src/mutations/assignment/schemas/saveScheduleAssignmentDraft.test.ts` - Draft payload parsing and duplicate rejection coverage.
- `src/mutations/assignment/dal/assignmentDal.test.ts` - Draft replacement validation and persistence coverage.
- `src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts` - Admin guard and cache invalidation coverage.
- `src/shared/model/assignment.test.ts` - Shared assignment contract coverage.

## Decisions Made
- Kept the worker confirmed-read contract on direct RLS-backed table access so the Phase 4 worker query can stay session-bound without a new DB abstraction.
- Derived `unassigned`, `draft_assigned`, and `confirmed_assigned` inside the query mapper so later UI work does not duplicate assignment-state logic.
- Reconciled draft rows by worker instead of delete-first replacement to preserve confirmed rows and reduce partial-write risk without adding a new RPC.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `apply_patch` was unavailable in this environment**
- **Found during:** Task 1 (contract and test scaffolding)
- **Issue:** The mandated edit tool failed before any file patch could be applied.
- **Fix:** Completed file creation and updates with direct PowerShell writes, then verified all targeted tests passed.
- **Files modified:** All runtime and planning files touched in this plan.
- **Verification:** `pnpm test -- src/shared/model/assignment.test.ts src/queries/assignment/dal/getAdminScheduleAssignmentDetail.test.ts src/mutations/assignment/schemas/saveScheduleAssignmentDraft.test.ts src/mutations/assignment/dal/assignmentDal.test.ts src/mutations/assignment/actions/saveScheduleAssignmentDraft.test.ts`
- **Committed in:** None - commits were explicitly disabled by user instruction.

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fallback changed the editing method only. Runtime scope and verification stayed aligned with the plan.

## Issues Encountered
- The repository was already in a dirty state before execution. Existing unrelated changes were preserved and left untouched.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 3 plan 2 can add the explicit confirm mutation on top of the new assignment table and draft-save path.
- Admin UI work can use the schedule-centered read model directly without extra applicant-state shaping.
- Worker confirmed assignment and pay preview queries now have the database policies they need for direct session-bound reads.

## Self-Check: PASSED
