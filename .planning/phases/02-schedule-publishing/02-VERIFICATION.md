---
phase: 02-schedule-publishing
verified: 2026-04-05T20:02:07.7069104+09:00
status: human_needed
score: 4/4 must-haves verified
human_verification:
  - test: "Live admin schedule creation and recruiting-state visibility"
    expected: "Creating a schedule from `/admin/schedules` persists the new row, the configured role-slot counts, and shows the saved schedule as `recruiting` without manual refresh."
    why_human: "The automated bundle proves parsing, persistence, and render contracts, but not the full browser-plus-Supabase round trip."
  - test: "Live worker apply-once flow from `/worker/schedules`"
    expected: "A worker sees recruiting schedules, can apply once, and then sees the applied state instead of another active apply control."
    why_human: "The action and page tests cover the server/UI contract, but the live session-backed RLS path still needs manual confirmation."
---

# Phase 02: Schedule Publishing Verification Report

**Phase Goal:** Let admins create schedules with role-slot headcounts, manage lightweight publishing state, and let workers browse recruiting schedules and apply at the schedule level.
**Verified:** 2026-04-05T20:02:07.7069104+09:00
**Status:** human_needed
**Re-verification:** Yes - evidence materialized during Phase 09 verification reconciliation from current code, current tests, and existing Phase 02 summaries.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Admin schedule creation persists a real schedule row with normalized start/end timestamps. | VERIFIED | `src/mutations/schedule/actions/createSchedule.test.ts` proves the action calls the DAL with normalized `+09:00` timestamps, and `src/mutations/schedule/dal/scheduleDal.test.ts` proves the RPC-backed write returns a persisted schedule row. |
| 2 | Schedule creation keeps role-slot headcounts and defaults new schedules to `recruiting`. | VERIFIED | The DAL regression in `src/mutations/schedule/dal/scheduleDal.test.ts` asserts the exact `roleSlots` payload and default `recruiting` status, and `02-schedule-publishing-01-SUMMARY.md` records the atomic `create_schedule_with_slots` pattern. |
| 3 | Admin publishing uses a lightweight state path between `recruiting` and `assigning`, while the generic list-status path refuses direct `confirmed` transitions. | VERIFIED | `src/mutations/schedule/actions/updateScheduleStatus.test.ts` covers the allowed `recruiting <-> assigning` flow and rejects direct `confirmed`, while `src/mutations/schedule/dal/scheduleDal.test.ts` locks confirmed schedules from the generic status path. |
| 4 | Worker recruiting visibility stays lightweight on `/worker/schedules` and merges current-user applied state over recruiting-only schedules. | VERIFIED | `src/queries/schedule/dal/listRecruitingSchedules.test.ts` proves the read model returns only recruiting schedules with minimal fields, `src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` proves the page renders the list and applied state, and `src/mutations/application/actions/createScheduleApplication.test.ts` proves duplicate applies normalize to `already_applied`. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `supabase/migrations/20260401_phase2_schedule_publishing.sql` | Atomic schedule persistence contract with role-slot support | VERIFIED | Phase 02 plan summaries still point at the migration-backed `create_schedule_with_slots` RPC used by the current DAL and action tests. |
| `src/mutations/schedule/dal/scheduleDal.ts` | RPC-backed schedule create and lightweight status-update DAL | VERIFIED | Current tests cover both create persistence and the constrained status-update path. |
| `src/mutations/schedule/actions/createSchedule.ts` | Admin-only schedule creation action | VERIFIED | Current action regression proves admin-only access and normalized payload forwarding. |
| `src/mutations/schedule/actions/updateScheduleStatus.ts` | Admin-only schedule publishing action | VERIFIED | Current action regression proves lightweight transition handling and `confirmed` rejection. |
| `src/queries/schedule/dal/listRecruitingSchedules.ts` | Recruiting-only worker schedule read model | VERIFIED | Current query regression proves minimal field selection, recruiting-only filtering, and start-time ordering. |
| `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` | Thin worker recruiting flow for `/worker/schedules` | VERIFIED | Current component regression proves schedule rendering and applied-state merge for the signed-in worker. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/mutations/schedule/actions/createSchedule.ts` | `src/mutations/schedule/dal/scheduleDal.ts` | Admin creation action delegates one normalized payload to the DAL | WIRED | The action test proves the exact DAL payload for schedule create. |
| `src/mutations/schedule/dal/scheduleDal.ts` | `supabase/migrations/20260401_phase2_schedule_publishing.sql` | `create_schedule_with_slots` RPC | WIRED | The DAL test proves the RPC contract and the default `recruiting` response shape used by the action. |
| `src/mutations/schedule/actions/updateScheduleStatus.ts` | `src/mutations/schedule/dal/scheduleDal.ts` | Generic list-status update path | WIRED | The action and DAL regressions prove lightweight `recruiting/assigning` transitions and confirmed-status lockout. |
| `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` | `src/queries/schedule/dal/listRecruitingSchedules.ts` | Server-first recruiting list composition | WIRED | The worker page regression proves the page consumes the recruiting-only query result before rendering. |
| `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` | `src/mutations/application/actions/createScheduleApplication.ts` | Apply/applied state on the recruiting list | WIRED | Current component and action regressions prove applied-state merge and duplicate-apply normalization. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/mutations/schedule/actions/createSchedule.ts` | `startsAt`, `endsAt`, `roleSlots` | Admin form payload normalized by the schedule schema | Yes | FLOWING |
| `src/mutations/schedule/actions/updateScheduleStatus.ts` | `scheduleId`, `status` | Admin schedule list inline status controls | Yes | FLOWING |
| `src/flows/worker-schedules/components/WorkerSchedulesPage.tsx` | `schedules`, `appliedScheduleIds` | `listRecruitingSchedules()` plus `listMyScheduleApplicationIds(currentUser.id)` | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Phase 02 schedule publishing evidence bundle | `pnpm exec vitest run src/mutations/schedule/dal/scheduleDal.test.ts src/mutations/schedule/actions/createSchedule.test.ts src/mutations/schedule/actions/updateScheduleStatus.test.ts src/queries/schedule/dal/listRecruitingSchedules.test.ts src/mutations/application/actions/createScheduleApplication.test.ts src/flows/worker-schedules/components/WorkerSchedulesPage.test.tsx` | 6 files passed, 15 tests passed | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `SCHD-01` | `02-01-PLAN.md` | Admin can create a schedule with date, start time, and end time. | SATISFIED | The create action and DAL regressions prove normalized timestamp input becomes a persisted schedule row. |
| `SCHD-02` | `02-01-PLAN.md` | Admin can define per-schedule role slots and headcounts. | SATISFIED | The create DAL regression proves role-slot payloads persist atomically with the schedule. |
| `SCHD-03` | `02-02-PLAN.md` | Admin can manage lightweight schedule publishing state. | SATISFIED | The status action and DAL regressions prove `recruiting/assigning` transitions work and the generic path refuses direct publish. |
| `APPL-01` | `02-03-PLAN.md` | Workers can review recruiting schedules. | SATISFIED | The recruiting-list query and worker page regressions prove the lightweight recruiting list renders on `/worker/schedules`. |

Supporting context: `APPL-02` is still exercised by the current Phase 02 apply tests, but milestone traceability intentionally maps that requirement to Phase 07 because the downstream admin freshness contract was closed there.

### Anti-Patterns Found

None.

### Human Verification Required

### 1. Live admin schedule creation and recruiting-state visibility

**Test:** Create a schedule from `/admin/schedules` with at least two role slots.
**Expected:** The new schedule persists, appears in the admin list, and shows `recruiting` as its initial status.
**Why human:** The automated bundle proves parsing and persistence contracts, but not the real browser form and Supabase round trip.

### 2. Live worker apply-once flow from `/worker/schedules`

**Test:** Sign in as a worker, open `/worker/schedules`, apply to one recruiting schedule, then revisit the page.
**Expected:** The schedule remains visible and the UI shows the applied state instead of a second active apply control.
**Why human:** The tests prove the action and render contract, but not the live session-backed RLS path.

### Gaps Summary

No automated implementation gaps were found against the Phase 02 goal. The missing verification artifact has now been rebuilt from current code and current tests, the stale validation commands were updated to direct `pnpm exec vitest run ...`, and the remaining work is live confirmation of the real browser-plus-Supabase create/apply loop.

---

_Verified: 2026-04-05T20:02:07.7069104+09:00_
_Verifier: Codex (inline Phase 09 execution)_
