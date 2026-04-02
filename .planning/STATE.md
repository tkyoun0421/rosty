---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: verifying
stopped_at: Paused Phase 04 UAT with 2 tests remaining
last_updated: "2026-04-02T00:10:00Z"
last_activity: 2026-04-02
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 17
  completed_plans: 17
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** Build a single-venue internal staffing tool where admins can quickly confirm work assignments and workers can clearly review confirmed work, role context, and expected pay.
**Current focus:** Phase 04 UAT completion, then Phase 05 manual dashboard verification

## Current Position

Phase: 04 (attendance-check-in) -> VERIFYING
Plan: UAT 3 of 5 tests passed
Status: Paused waiting for manual admin-side verification
Last activity: 2026-04-02

Progress: [complete][complete][complete][active-uat][pending-human-uat]

## Performance Metrics

**By Phase:**
| Phase | Plans | Result |
|-------|-------|--------|
| 1. Access Foundation | 4 | complete |
| 2. Schedule Publishing | 3 | complete |
| 3. Assignment And Pay Preview | 4 | complete |
| 4. Attendance Check-In | 3 | complete |
| 5. Operations Dashboard | 3 | implementation complete, human UAT pending |
| Phase 05 P01 | 16min | 2 tasks | 6 files |
| Phase 05 P03 | 5min | 2 tasks | 8 files |
| Phase 05 P02 | 11min | 2 tasks | 5 files |

## Accumulated Context

### Decisions

- Start as a single-venue internal staffing tool.
- Use one account system with role-based permissions.
- Phase 1: invite acceptance uses token possession without email-match enforcement.
- Phase 1: login returns to `/` first, then role-based routing happens there.
- Phase 1: worker rates use current-value storage with audit columns only.
- Phase 2: one schedule contains multiple role slots.
- Phase 2: workers apply to the schedule as a whole, not a specific role slot.
- Phase 2: schedule creation defaults to `recruiting`, then admins manage later transitions.
- Phase 2: worker recruitment listing stays lightweight.
- Phase 2: privileged schedule writes require a strict DB-backed `requireAdminUser` guard.
- Phase 3: applicant review happens on the schedule detail screen.
- Phase 3: assignments are made per role slot and final confirmation is explicit.
- Phase 3: workers see total expected pay plus calculation basis.
- Phase 4: check-in timing follows the venue first-ceremony rule, not a generic shift-relative window.
- Phase 4: if first ceremony is `10:00`, check-in opens at `08:20`.
- Phase 4: if first ceremony is `11:00` or later, check-in opens `1 hour 50 minutes before first ceremony`.
- Phase 4: location validation uses one venue coordinate plus one allowed radius.
- Phase 4: attendance submission is allowed once only, with no re-submission.
- Phase 4: admin attendance review is schedule-centric and includes worker attendance and lateness status.
- Phase 5: operations dashboard uses schedule cards as the primary summary unit.
- Phase 5: anomaly priority is `unfilled slots > missing check-ins > lateness`.
- Phase 5: dashboard scope is `today + nearby upcoming schedules`.
- Phase 5: the dashboard stays summary-first and routes drill-down to existing schedule detail pages.
- Codebase rules: use `#` absolute imports only and forbid relative imports.
- Codebase rules: action files orchestrate only; schema and normalization logic stay in `schemas/`.
- Codebase rules: prefer tag-based invalidation over `revalidatePath`.
- Codebase rules: pure helpers belong in domain `utils/` or `shared`, not inside component files.
- [Phase 05]: Keep dashboard anomaly classification request-time while caching only raw schedule rows for the active dashboard window.
- [Phase 05]: Count only confirmed assignments toward staffed coverage so draft rows cannot clear an unfilled slots anomaly.
- [Phase 05]: Keep dashboard freshness verification at the action-test level and avoid route-level revalidation fallback.
- [Phase 05]: Revalidate dashboard tags directly from schedule, assignment, and attendance mutations that change dashboard-visible state.
- [Phase 05]: Keep admin access enforcement inside AdminOperationsDashboardPage so the thin /admin route stays declarative.
- [Phase 05]: Normalize dashboard anomaly badges to the locked UI-spec labels instead of exposing DAL label casing directly.

### Pending Todos

- Finish Phase 4 UAT in `.planning/phases/04-attendance-check-in/04-UAT.md`.
- After Phase 4 closes, run Phase 5 human UAT in `.planning/phases/05-operations-dashboard/05-HUMAN-UAT.md`.
- Run manual UAT for the latest profile onboarding and first-admin bootstrap flow.
- Optionally repair older planning documents that still display mojibake in this shell.

### Blockers/Concerns

- `STATE.md` had drifted from the actual workflow state and previously pointed at Phase 5 execution even though active work was manual verification.
- `gsd-next` will prefer the active UAT session until `.planning/phases/04-attendance-check-in/04-UAT.md` is completed or explicitly abandoned.
- Historical planning documents had encoding damage in shell output. Use `pnpm encoding:check` and repository bytes as the source of truth.
- PowerShell console rendering may still display mojibake even when files are valid UTF-8 without BOM.

## Session Continuity

Last session: 2026-04-02T00:10:00Z
Stopped at: Phase 4 UAT paused after 3 passes and before admin attendance checks
Resume file: `.planning/phases/04-attendance-check-in/04-UAT.md`

---
*State refreshed: 2026-04-02 after pausing Phase 4 UAT*


