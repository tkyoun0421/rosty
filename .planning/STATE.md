---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 04-attendance-check-in-03-PLAN.md without commits per user instruction (04-02 still pending)
last_updated: "2026-03-31T11:37:49Z"
last_activity: 2026-03-31 -- Completed Phase 04 Plan 03 out of order
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 14
  completed_plans: 13
  percent: 93
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** Build a single-venue internal staffing tool where admins can quickly confirm work assignments and workers can clearly review confirmed work, role context, and expected pay.
**Current focus:** Phase 04 — attendance-check-in

## Current Position

Phase: 04 (attendance-check-in) — EXECUTING
Plan: 2 of 3
Status: Ready to execute
Last activity: 2026-03-31 (04-03 complete, 04-02 pending)

Progress: [complete][complete][complete][active][pending] 93%

## Performance Metrics

**By Phase:**
| Phase | Plans | Result |
|-------|-------|--------|
| 1. Access Foundation | 4 | complete |
| 2. Schedule Publishing | 3 | complete |
| 3. Assignment And Pay Preview | 4 | complete |
| 4. Attendance Check-In | 2/3 | in progress |
| Phase 04-attendance-check-in P01 | 10min | 2 tasks | 12 files |
| Phase 04-attendance-check-in P02 | 10min | 2 tasks | 6 files |

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
- Phase 4: check-in timing follows the venue first-meal rule, not a generic shift-relative window.
- Phase 4: if first meal is `10:00`, check-in opens at `08:20`.
- Phase 4: if first meal is `11:00` or later, check-in opens `1 hour 50 minutes before first meal`.
- Phase 4: location validation uses one venue coordinate plus one allowed radius.
- Phase 4: attendance submission is allowed once only, with no re-submission.
- Phase 4: admin attendance review is schedule-centric and includes worker attendance and lateness status.
- Codebase rules: use `#` absolute imports only and forbid relative imports.
- Codebase rules: action files orchestrate only; schema and normalization logic stay in `schemas/`.
- Codebase rules: prefer tag-based invalidation over `revalidatePath`.
- Codebase rules: pure helpers belong in domain `utils/` or `shared`, not inside component files.
- [Phase 04-attendance-check-in]: Attendance window logic stays anchored to schedules.starts_at, with a special 08:20 opening for 10:00 starts and a 110-minute lead for 11:00 or later starts.
- [Phase 04-attendance-check-in]: Attendance writes snapshot submitted coordinates, computed distance, allowed radius, and lateness at insert time so downstream reads do not recompute validation.
- [Phase 04-attendance-check-in]: Geolocation access, secure-context checks, and one-shot submit feedback stay inside the client card while backend timing and submission state stay in the attendance query slice.

### Pending Todos

- Execute Phase 4 Plan 02 worker attendance UI.
- Run manual UAT for the latest profile onboarding and first-admin bootstrap flow.
- Review and optionally commit the out-of-order Phase 4 Plan 03 admin attendance work if approved.

### Blockers/Concerns

- Historical planning documents had encoding damage in shell output. Use `pnpm encoding:check` and repository bytes as the source of truth.
- PowerShell console rendering may still display mojibake even when files are valid UTF-8 without BOM.

## Session Continuity

Last session: 2026-03-31T11:38:34.055Z
Stopped at: Completed 04-attendance-check-in-03-PLAN.md without commits per user instruction (04-02 still pending)
Resume file: None

---
*State refreshed: 2026-03-31 after Phase 4 Plan 03 execution*
